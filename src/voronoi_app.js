import {defined,html} from "./web-js-utils.js"
import {Svg} from "./svg_utils.js"
import {voronoi_diag} from "./voronoi_diag.js"
import {Seeds} from "./seeds.js"
import { Shape } from "./shape.js"

class voronoi_app{
    constructor(){
        let [w,h] = ["100%","100%"]
        let parent = document.createElement("template")
        this.parent = parent
        //const use_storage = false
        let init_needed = false
        this.version = "55"
        const config = JSON.parse(localStorage.getItem("voronoi_config"))
        if(config === null){
            console.log("First time usage, no config stored")
            init_needed = true
        }else{
            if(config.version == this.version){
                console.log(`same version ${this.version}, loading`)
                //console.log(config)
                Object.assign(this,config)
            }else{
                console.log(`version mismatch (localstorage = ${config.version} , loaded page = ${this.version}) reinitialising`)
                init_needed = true
            }
        }

        if(init_needed){
            this.cell_debug = 0;
            this.min_edge = 6
            this.is_color = false//not usable yet as flickers on updates
            this.width = 0
            this.height = 0
            this.cells_shape = "cubic"
            this.cells_space = 2
            this.vertical_view = false
            this.view_svg = {
                cells:true,
                edges:false,
                seeds:true,
                shape:true
            }
            this.mouse_action = "move"
            this.export_ratio = 1.0
            this.export_svg = {
                cells:true,
                edges:false,
                seeds:false,
                shape:true
            }
        }
        this.shape = new Shape()
        this.diagram = new voronoi_diag(this.shape)
        this.seeds = new Seeds(this.shape)
        if(!init_needed){
            this.seeds.load_config(JSON.parse(localStorage.getItem("seeds_config")))
            this.shape.config = JSON.parse(localStorage.getItem("shape_config"))
        }

        this.svg = {}
        this.svg.main = html(parent,/*html*/`<svg id="main_svg" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"></svg>`);
        this.shape.update({parent:this.svg.main})
        this.svg.seeds_area = null;


        this.init_events()
    }
    
    set_parent(new_parent,width,height){
        //this.svg.main.parentElement.removeChild(this.svg.main)
        new_parent.appendChild(this.svg.main)
        this.svg.main.setAttributeNS(null,"width",width)
        this.svg.main.setAttributeNS(null,"height",height)
    }

    element(){
        return this.svg.main
    }

    clear_svg(svg_el){
        let children = [ ...svg_el.children];
        children.forEach((child)=>{
            child.parentElement.removeChild(child)
        })
    }

    draw_svg(svg_el,draw_cfg){
        this.clear_svg(svg_el)
        if(draw_cfg.shape){
            this.shape.draw(svg_el)
        }
        if(draw_cfg.cells){
            const params = {
                svg:svg_el,
                shape:this.cells_shape,
                color:this.is_color,
                min_edge:this.min_edge,
                retraction:this.cells_space,
                debug:this.cell_debug
            }
            this.diagram.draw_cells(params)
        }
        if(draw_cfg.edges){
            this.diagram.draw_edges({svg:svg_el})
        }
        if(draw_cfg.seeds){
            this.seeds.draw({svg:svg_el})
        }
        this.store()
    }

    draw(){
        this.draw_svg(this.svg.main,this.view_svg)
    }

    store(){
        let config = Object.assign({},this)
        delete config.parent
        delete config.svg
        delete config.seeds
        delete config.diagram
        delete config.shape
        //console.log(`storing config version ${config.version}`)
        localStorage.setItem("voronoi_config",JSON.stringify(config))
        localStorage.setItem("seeds_config",JSON.stringify(this.seeds.config))
        localStorage.setItem("shape_config",JSON.stringify(this.shape.config))
    }

    compute_voronoi(){
        this.diagram.compute(this.seeds.get_seeds(),{xl:0, xr:parseFloat(this.width), yt:0, yb:parseFloat(this.height)})
        this.draw()
    }

    update(params){
        params.context = this
        this.diagram.update(params)
        this.seeds.update(params)
        this.shape.update(params)
        if(defined(params.cell_debug)){
            this.draw()
        }
        if(defined(params.debug)){
            this.draw()
        }
        if(defined(params.shape_seeds)){
            this.seeds.update({clear:true})
            this.compute_voronoi()
        }
        if(defined(params.shape_cells)){
            this.draw()
        }
        if(defined(params.map)){
            // && (this.shape.map_used)
            //TODO shall be events based
            if(params.map == "clear"){
                this.seeds.update({clear:true})
                this.compute_voronoi()
            }else{
                fetch(`./data/${params.map}.png`)
                .then(response => response.arrayBuffer())
                .then((image_buffer) => {
                    this.shape.load_cost_map(image_buffer,()=>{
                        this.seeds.update({clear:true})
                        this.compute_voronoi()
                    })
                })
            }
        }
    }

    update_seeds(params){
        this.seeds.update(params)
        this.compute_voronoi()
    }

    update_size(clear){
        this.max_width = this.svg.main.clientWidth
        this.max_height = this.svg.main.clientHeight
        if((this.width == 0) || (this.width > this.max_width)){
            this.width = this.max_width
        }
        if((this.height == 0) || (this.height > this.max_height)){
            this.height = this.max_height
        }
        console.log(`set svg ( ${this.width} , ${this.height} )`)
        this.update_seeds({clear:clear,width:this.width,height:this.height})
    }
    resize(width,height){
        this.svg.main.setAttributeNS(null,"width",`${width}%`)
        this.max_width = this.svg.main.clientWidth
        this.max_height = window.innerHeight * height / 100
        this.svg.main.setAttributeNS(null,"height",this.max_height)
        this.width = this.max_width
        this.height = this.max_height
        console.log(`set svg ( ${this.width} , ${this.height} )`)
        this.update_seeds({clear:false,width:this.width,height:this.height})
    }


    save_svg(fileName){
        let svg_out = this.svg.main.cloneNode()//lazy, just for new svg creation
        this.draw_svg(svg_out,this.export_svg)
        let svg = new Svg()
        svg.save(fileName,svg_out)
    }

    save_seeds(fileName){
        this.seeds.save(fileName)
    }

    load_dropped_svg(reader){
        console.log("svg dropped")
        const vor_context = this
        reader.onloadend = function(e){vor_context.shape.load_path(this.result,vor_context)};
    }
    load_dropped_png(reader){
        console.log("png dropped")
        const vor_context = this
        reader.onloadend = function(e) {
            vor_context.shape.load_cost_map(this.result,
                ()=>{
                    vor_context.seeds.update({clear:true})
                    vor_context.compute_voronoi()
                });
        };
    }
    load_dropped_seeds(reader){
        console.log("extention check - OK")
        let is_valid = false;
        const vor_context = this
        reader.onloadend = function(e) {
            var result = JSON.parse(this.result);
            if(Array.isArray(result)){
                console.log("array type - OK")
                if(result.length > 0){
                    console.log("length - OK")
                    const seed0 = result[0]
                    if((defined(seed0.x)) && (defined(seed0.y)) &&(defined(seed0.id))){
                        console.log("seed structure - OK")
                        is_valid = true
                    }
                }
            }
            if(is_valid){
                vor_context.seeds.load(result)
                vor_context.compute_voronoi()
            }else{
                alert(`unsupported seeds format`);
            }
        };
    }
    load_dropped_file(file){
        var reader = new FileReader();
        let extension = file.name.split('.').pop();
        if(extension == "json"){
            this.load_dropped_seeds(reader)
            reader.readAsText(file);
        }else if(extension == "svg"){
            this.load_dropped_svg(reader)
            reader.readAsText(file);
        }else if(extension == "png"){
            this.load_dropped_png(reader)
            reader.readAsArrayBuffer(file);
        }else{
            alert(`unsupported file format`);
        }
    }
    vor_app_event(e){
        const that = e.detail.context
        if(e.detail.type == "draw"){
            that.draw()
        }else if(e.detail.type == "compute"){
            that.compute_voronoi()
            //includes draw()
        }else if(e.detail.type == "seeds"){
            that.seeds.update({clear:true})
            that.compute_voronoi()
            //includes draw()
        }
    }

    init_events(){
        $(this.svg.main).click((e)=>{
            if(this.mouse_action == "add"){
                this.seeds.add({x:e.clientX, y:e.clientY})
                this.compute_voronoi()
            }else if(this.mouse_action == "remove"){
                this.seeds.remove({x:e.clientX, y:e.clientY})
                this.compute_voronoi()
            }
        })
        $(this.svg.main).mousemove((e)=>{
            if(this.mouse_action == "move"){
                if(e.buttons == 1){
                    this.seeds.move({x:e.clientX, y:e.clientY})
                    this.compute_voronoi()
                }
            }
        })
        $(this.svg.main).on("touchmove",(e)=>{
            console.log(e.target.tagName)
            if(this.mouse_action == "move"){
                this.seeds.move({x:e.touches[0].clientX, y:e.touches[0].clientY})
                this.compute_voronoi()
            }
        })
        $(this.svg.main).mousedown((e)=>{
            console.log("mouse down")
            if(this.mouse_action == "move"){
                this.seeds.move({x:e.clientX, y:e.clientY})
                this.compute_voronoi()
            }
        })
        $(this.svg.main).on("touchstart",(e)=>{
            console.log()
            const [x,y] = [e.touches[0].clientX,e.touches[0].clientY]
            if(this.mouse_action == "add"){
                this.seeds.add({x:x, y:y})
            }else if(this.mouse_action == "move"){
                this.seeds.move({x:x, y:y})
            }else if(this.mouse_action == "remove"){
                this.seeds.remove({x:x, y:y})
            }
            this.compute_voronoi()
            e.preventDefault()
        })

        window.addEventListener("vor_app",this.vor_app_event,false)

        let that = this
        let onDragEvents = function(event){
            event.stopPropagation();
            event.preventDefault();
            if(event.type == "dragenter"){
                event.dataTransfer.dropEffect = "copy";
            }
            if(event.type == "drop"){
                if(event.dataTransfer.files.length != 1){
                    alert("only one file allowed");
                    console.log(event.dataTransfer.files);
                    return;
                }else{
                    that.load_dropped_file(event.dataTransfer.files[0]);
                }
            };
        }
    
        document.addEventListener('dragenter', onDragEvents, false)
        document.addEventListener('dragover',  onDragEvents, false)
        document.addEventListener('dragleave', onDragEvents, false)
        document.addEventListener('drop',      onDragEvents, false)
    }


}



export {voronoi_app};
