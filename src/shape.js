import {html, defined,image} from "./utils.js"
import {Geometry} from "./geometry.js"
import {Svg} from "./svg_utils.js"

let geom = new Geometry()
let svg = new Svg()
class Shape{
    constructor(){
        this.used = "nothing"//["nothing","path","map"]
        this.svg_path = null
        this.img = {url:"",el:null,canvas:null}
        this.svg_string = ""
        this.path_points = []
        this.cells_action_list = ["in_cells","cut_off","all"]
        this.seeds_action_list = ["inside","avoid_path","ignore"];//"symmetric" might not be necessary
        this.config = {}
        let cfg = this.config
        cfg.cells_action = "cut_off"
        cfg.seeds_action = "ignore"
        cfg.debug = true
        cfg.view_shape = true
        this.parent = null
    }

    update(params){
        if(defined(params.shape_cells)){
            this.config.cells_action = params.shape_cells
        }
        if(defined(params.debug)){
            this.config.debug = params.debug
        }
        if(defined(params.view_shape)){
            this.config.view_shape = params.view_shape
        }
        if(defined(params.parent)){
            this.parent = params.parent
        }
        if(defined(params.shape_seeds)){
            this.config.seeds_action = params.shape_seeds
        }
    }

    append_path(){
        if(this.used != "path"){return}
        this.parent.appendChild(this.svg_path)
    }
    remove_path(){
        if(this.used != "path"){return}
        if(this.svg_path.parentElement != null){
            this.svg_path.parentElement.removeChild(this.svg_path)
        }
        //this.parent.removeChild()
    }

    sample_inside_path(){
        return ((this.used=="path") && (this.config.seeds_action=="inside"))
    }
    sample_avoid_path(){
        return ((this.used=="path") && (this.config.seeds_action=="avoid_path"))
    }
    sample_symmetric(){
        return ((this.used=="path") && (this.config.seeds_action=="symmetric"))
    }
    sample_with_cost(){
        return (this.used=="map")
    }

    show_inside_path(){
        return ((this.used=="path") && (this.config.cells_action=="in_cells" || this.config.cells_action=="but_off"))
    }

    draw_path(svg_el){
        let group = html(svg_el,"g",/*html*/`<g id="svg_g_shape_path"/>`)
        if(this.config.cells_action == "cut_off"){
            html(group,"defs",/*html*/`
            <defs>
                <clipPath id="cut-off-cells">
                    ${this.svg_string}
                </clipPath>
            </defs>`)
        }
        //if the user config is to draw the shape and it's of type "path", then draw it
        if(this.config.view_shape){
            html(group,"path",/*html*/`${this.svg_string}`)
        }
        if(this.config.debug == true){
            this.path_points.forEach((p)=>{
                html(group,"circle",/*html*/`<circle cx=${p.x} cy=${p.y} r="2" fill="green" />`)
            })
        }
    }
    draw_map(svg_el){
        let group = html(svg_el,"g",/*html*/`<g id="svg_g_shape_map"/>`)
        svg.pattern(svg_el,this.img.url,this.img.el.width,this.img.el.height)
        //image(group,this.img.url)
    }
    draw(svg_el){
        if(this.used == "path"){
            this.draw_path(svg_el)
        }else if(this.used == "map"){
            this.draw_map(svg_el)
        }
    }

    load_path(svg_file){
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
            path.setAttributeNS(null,"fill-opacity",0.1)
            path.setAttributeNS(null,"fill","#115522")
            path.id = "seeds_area"
            this.svg_path = path
            let s = new XMLSerializer();
            this.svg_string = s.serializeToString(path);
            is_taken = true
            this.path_points = geom.compute_path_points(path,20)
        }else{
            alert(`only supported import of SVG with a single path on the top level`)
        }
        if(is_taken){
            this.used = "path"
        }
        return is_taken
    }
    get_cost(s){
        if(this.used != "map"){
            return 0
        }
        if((s.x>=this.img.el.width) ||(s.y>=this.img.el.height)){
            return 10000
        }
        let val = this.img.canvas.getContext('2d').getImageData(s.x,s.y,1,1).data[0]
        return (val / 255.0) 
    }
    load_cost_map(array_buffer,done){

        var blob = new Blob([array_buffer], {type: 'image/png'});
        this.img.url = URL.createObjectURL(blob);
        this.img.el = document.createElement("img");
        this.img.el.setAttribute('src', this.img.url);
        let that = this
        $(this.img.el).on("load",()=>{
            console.log(`image loaded (${that.img.el.width},${that.img.el.height})`)
            that.used = "map"
            let cv = document.createElement('canvas');
            that.img.canvas = cv
            cv.width = that.img.el.width;
            cv.height = that.img.el.height;
            cv.getContext('2d').drawImage(that.img.el, 0, 0, cv.width,cv.height);
            done()
        })
    }
}

export{Shape}
