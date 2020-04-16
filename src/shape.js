
class Shape{
    constructor(){
        this.enabled = false
        this.svg_path = null
        this.svg_string = ""

        this.config = {}
        let cfg = this.config
        cfg.cells_action = {
            in_cells:true,
            cut_off:false,
            none:false
        }
        cfg.seeds_action = {
            inside:true,
            avoid_path:false,
            symmetric:false,
            none:false
        }
        cfg.view = {
            display:false,
            export:false
        }
    }

    draw(){

    }
}

export{Shape}
