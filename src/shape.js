import {html, defined,image,send} from "./web-js-utils.js"
import {Geometry} from "./geometry.js"
import {Svg} from "./svg_utils.js"

let geom = new Geometry()
let svg = new Svg()
class Shape{
    constructor(){
        this.path_used = false
        this.map_used = false
        this.svg_path = null
        this.map = {url:"",img:null,canvas:null}
        this.svg_string = ""
        this.path_points = []
        this.cells_action_list = ["in_cells","cut_off","all"]
        this.seeds_action_list = ["inside","avoid_path","ignore"];//"symmetric" might not be necessary
        this.config = {}
        let cfg = this.config
        cfg.cells_action = "in_cells"
        cfg.seeds_action = "avoid_path"
        cfg.debug = false
        cfg.view_shape = true
        cfg.view_map = true
        this.parent = null
    }

    update(params){
        if(defined(params.shape_cells)){
            this.config.cells_action = params.shape_cells
        }
        if(defined(params.debug)){
            this.config.debug = params.debug
            send("vor_app",{type:"draw",context:params.context})
        }
        if(defined(params.view_shape)){
            this.config.view_shape = params.view_shape
            send("vor_app",{type:"draw",context:params.context})
        }
        if(defined(params.view_map)){
            this.config.view_map = params.view_map
            send("vor_app",{type:"draw",context:params.context})
        }
        if(defined(params.parent)){
            this.parent = params.parent
        }
        if(defined(params.shape_seeds)){
            this.config.seeds_action = params.shape_seeds
        }
        if(defined(params.map)){
            if(params.map == "clear"){
                this.clear_map()
            }else if(params.map == "sine"){
                //this.sine_map(params.w,params.h)
            }
        }
        if(defined(params.path_file)){
            if(params.path_file == "clear"){
                this.clear_path()
                send("vor_app",{type:"seeds",context:params.context})
            }else{
                fetch(`./data/${params.path_file}.svg`)
                .then(response => response.text())
                .then((svg_text) => {
                    this.load_path(svg_text,params.context)
                })
            }
        }
    }

    append_path(){
        if(!this.path_used){return}
        this.parent.appendChild(this.svg_path)
    }
    remove_path(){
        if(!this.path_used){return}
        if(this.svg_path.parentElement != null){
            this.svg_path.parentElement.removeChild(this.svg_path)
        }
        //this.parent.removeChild()
    }

    sample_inside_path(){
        return ((this.path_used) && (this.config.seeds_action=="inside"))
    }
    use_cost_path(){//valid for both "inside" and "avoid_path"
        return ((this.path_used) && (this.config.seeds_action!="ignore"))
    }
    //sample_avoid_path(){
    //    return ((this.path_used) && (this.config.seeds_action=="avoid_path"))
    //}
    //sample_symmetric_path(){
    //    return ((this.path_used) && (this.config.seeds_action=="symmetric"))
    //}
    use_cost_map(){
        return (this.map_used)
    }

    show_inside_path(){
        return ((this.path_used) && (this.config.cells_action=="in_cells" || this.config.cells_action=="cut_off"))
    }

    draw_path(svg_el){
        let group = html(svg_el,/*html*/`<g id="svg_g_shape_path"/>`)
        if(this.config.cells_action == "cut_off"){
            html(group,/*html*/`
            <defs>
                <clipPath id="cut-off-cells">
                    ${this.svg_string}
                </clipPath>
            </defs>`)
        }
        //if the user config is to draw the shape and it's of type "path", then draw it
        if(this.config.view_shape){
            html(group,/*html*/`${this.svg_string}`)
            if(this.config.debug == true){
                this.path_points.forEach((p)=>{
                    html(group,/*html*/`<circle cx=${p.x} cy=${p.y} r="2" fill="green" />`)
                })
            }
        }
    }
    draw_map(svg_el){
        if(this.config.view_map){
            let group = html(svg_el,/*html*/`<g id="svg_g_shape_map"/>`)
            image(group,this.map.url)
        }
    }
    draw(svg_el){
        if(this.map_used){
            this.draw_map(svg_el)
        }
        if(this.path_used){
            this.draw_path(svg_el)
        }
    }

    clear_map(){
        this.map_used = false
        this.map = {url:"",img:null,canvas:null}
    }
    clear_path(){
        this.path_used = false
        this.svg_path = null
        this.svg_string = ""
        this.path_points = []
    }
    load_path(svg_file,context){
        let is_taken = false

        let template = document.createElement("template")
        template.insertAdjacentHTML("beforeend",svg_file);
        let elements = template.getElementsByTagName("svg");
        let res_svg =  elements[elements.length-1];
        template.removeChild(res_svg);
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
            path.setAttributeNS(null,"fill-opacity",0.2)
            path.setAttributeNS(null,"fill","#115522")
            path.id = "seeds_area"
            this.svg_path = path
            let s = new XMLSerializer();
            this.svg_string = s.serializeToString(path);
            is_taken = true
            this.path_points = geom.compute_path_points(path,20)
            this.path_points.splice(0,1)
            //console.log(this.path_points)
        }else{
            alert(`only supported import of SVG with a single path on the top level`)
        }
        if(is_taken){
            this.path_used = true
            send("vor_app",{type:"seeds",context:context})
        }
        return is_taken
    }
    get_cost(s){
        if(!this.map_used){
            return 0
        }
        if((s.x>=this.map.img.width) ||(s.y>=this.map.img.height)){
            return 100
        }
        let val = this.map.canvas.getContext('2d').getImageData(s.x,s.y,1,1).data[0]
        return (val / 255.0) 
    }
    sine_map(w,h){
        this.map.img = document.createElement("img");
        //console.log(`image loaded (${that.map.img.width},${that.map.img.height})`)
        this.map_used = true
        let cv = document.createElement('canvas');
        this.map.canvas = cv
        cv.width = w;
        cv.height = h;
        //cv.getContext('2d').drawImage(that.map.img, 0, 0, cv.width,cv.height);
    }
    load_cost_map(array_buffer,done){
        var blob = new Blob([array_buffer], {type: 'image/png'});
        this.map.url = URL.createObjectURL(blob);
        this.map.img = document.createElement("img");
        this.map.img.setAttribute('src', this.map.url);
        let that = this
        $(this.map.img).on("load",()=>{
            console.log(`image loaded (${that.map.img.width},${that.map.img.height})`)
            that.map_used = true
            let cv = document.createElement('canvas');
            that.map.canvas = cv
            cv.width = that.map.img.width;
            cv.height = that.map.img.height;
            cv.getContext('2d').drawImage(that.map.img, 0, 0, cv.width,cv.height);
            done()
        })
    }
}

export{Shape}
