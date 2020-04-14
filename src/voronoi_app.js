import {defined,html} from "./utils.js"
import {Svg} from "./svg_utils.js"
import {voronoi_diag} from "./voronoi_diag.js"
import {Seeds} from "./seeds.js"

let svg = new Svg()

class voronoi_app{
    constructor(parent,w,h){
        this.parent = parent
        //const use_storage = false
        let init_needed = false
        this.version = "35"
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
            this.min_edge = 8
            this.is_color = false//not usable yet as flickers on updates
            this.width = 0
            this.height = 0
            this.cells_shape = "cubic"
            this.cells_space = 5
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
        this.diagram = new voronoi_diag()
        this.seeds = new Seeds()
        if(!init_needed){
            this.seeds.load_config(JSON.parse(localStorage.getItem("seeds_config")))
        }

        this.svg = {}
        this.svg.main = html(parent,"svg",/*html*/`<svg id="main_svg" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"></svg>`);
        svg.set_parent(this.svg.main)
        this.svg.seeds_area = null;


        this.init_events()
    }
    
    change_parent(new_parent,width,height){
        this.svg.main.parentElement.removeChild(this.svg.main)
        new_parent.appendChild(this.svg.main)
        this.svg.main.setAttributeNS(null,"width",width)
        this.svg.main.setAttributeNS(null,"height",height)
    }

    clear_svg(svg_el){
        let children = [ ...svg_el.children];
        children.forEach((child)=>{
            child.parentElement.removeChild(child)
        })
    }

    draw_svg(svg_el,draw_cfg){
        this.clear_svg(svg_el)
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
        if(draw_cfg.shape){
            if(this.svg.seeds_area != null){
                //cloneNode() and cloneNode(true) do beak the original svg and the app crashes (max 100 iterations)
                svg_el.appendChild(this.svg.seeds_area)
            }
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
        //console.log(`storing config version ${config.version}`)
        localStorage.setItem("voronoi_config",JSON.stringify(config))
        localStorage.setItem("seeds_config",JSON.stringify(this.seeds.config))
    }

    compute_voronoi(){
        this.diagram.compute(this.seeds.get_seeds(),{xl:0, xr:parseFloat(this.width), yt:0, yb:parseFloat(this.height)})
        this.draw()
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


    save_svg(fileName){
        let svg_out = this.svg.main.cloneNode()//lazy, just for new svg creation
        this.draw_svg(svg_out,this.export_svg)
        svg.save(fileName,svg_out)
        //due to cloneNode bug, have to give it back to the view svg
        if(this.view_svg.shape){
            if(this.svg.seeds_area != null){
                this.svg.main.appendChild(this.svg.seeds_area)
            }
        }
    }

    update_seeds(params){
        this.seeds.update(params)
        this.compute_voronoi()
    }

    save_seeds(fileName){
        this.seeds.save(fileName)
    }

    load_dropped_svg(reader){
        console.log("svg dropped")
        const vor_context = this
        reader.onloadend = function(e) {
            let svg_text = this.result;
            vor_context.parent.insertAdjacentHTML("beforeend",svg_text);
            let elements = vor_context.parent.getElementsByTagName("svg");
            let res_svg =  elements[elements.length-1];
            vor_context.parent.removeChild(res_svg);
            let children = [...res_svg.childNodes];
            let nb_paths = 0
            let path = null
            children.forEach((c)=>{
                if(c.nodeType != Node.TEXT_NODE){
                    if(c.tagName == "path"){
                        nb_paths++
                        path = c
                    }
                }
            })
            if(nb_paths == 1){
                //check path inside window
                //check path closed
                //check path area min
                if(vor_context.svg.seeds_area != null){
                    console.log("svg import, previous path removed")
                    vor_context.svg.seeds_area.parentElement.removeChild(vor_context.svg.seeds_area)
                }
                vor_context.svg.seeds_area = path
                vor_context.svg.main.appendChild(path)
                path.setAttributeNS(null,"fill-opacity",0.2)
                path.setAttributeNS(null,"fill","#115522")
                path.id = "seeds_area"
                vor_context.seeds.update({path:path,id:"seeds_area"})
                vor_context.compute_voronoi()
            }else{
                alert(`only supported import of SVG with a single path on the top level`)
            }
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
        }else if(extension == "svg"){
            this.load_dropped_svg(reader)
        }else{
            alert(`unsupported file format`);
        }
        reader.readAsText(file);
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
    }
}


export {voronoi_app};
