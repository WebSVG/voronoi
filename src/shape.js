import {html, defined} from "./utils.js"
import {Geometry} from "./geometry.js"

let geom = new Geometry()
//let svg = new Svg()
class Shape{
    constructor(){
        this.enabled = false
        this.svg_path = null
        this.svg_string = ""
        this.path_points = []
        this.cells_action_list = ["in_cells","cut_off","none"]
        this.config = {}
        let cfg = this.config
        cfg.cells_action = "cut_off"
        cfg.seeds_action_list = ["inside","avoid_path","symmetric","none"]
        cfg.seeds_action = "inside"
        cfg.debug = true
        this.parent = null
    }

    update(params){
        if(defined(params.shape_cells)){
            this.config.cells_action = params.shape_cells
            this.enabled = (params.shape_cells != "none")
        }
        if(defined(params.debug)){
            this.config.debug = params.debug
        }
        if(defined(params.parent)){
            this.parent = params.parent
        }
    }

    append(){
        if(!this.enabled){return}
        this.parent.appendChild(this.svg_path)
    }
    remove(){
        if(!this.enabled){return}
        this.parent.removeChild(this.svg_path)
    }

    sample_inside(){
        return (this.enabled && (this.config.seeds_action=="inside"))
    }

    show_inside(){
        return (this.enabled && (this.config.cells_action!="none"))
    }

    draw(svg_el){
        if(!this.enabled){
            return
        }
        if(this.config.cells_action == "cut_off"){
            html(svg_el,"path",/*html*/`
            <defs>
                <clipPath id="cut-off-cells">
                    ${this.svg_string}
                </clipPath>
            </defs>`)
        }
        if(this.config.debug == true){
            this.path_points.forEach((p)=>{
                html(svg_el,"circle",/*html*/`<circle cx=${p.x} cy=${p.y} r="2" fill="green" />`)
            })
        }
        if(this.config.seeds_action == "inside"){
            html(svg_el,"path",this.svg_string)
        }
    }

    load(svg_file){
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
        this.enabled = is_taken
        return is_taken
    }
}

export{Shape}
