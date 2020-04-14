import {defined,html,save_json} from "./utils.js"
import * as vor_core from "../libs/rhill-voronoi-core.js"
import {Svg} from "./svg_utils.js"
import {voronoi_diag} from "./voronoi_diag.js"
import {Geometry} from "./geometry.js"

let geom = new Geometry()
let svg = new Svg()

function get_seeds(nb,w,h){
    let res = []
    for(let i = 0;i<nb; i++){
        res.push({
            id:i,
            x:Math.random()*w,
            y:Math.random()*h
        })
    }
    return res
}

function get_seed_samples(nb,w,h){
    let res = []
    for(let i = 0;i<nb; i++){
        res.push({
            x:Math.random()*w,
            y:Math.random()*h
        })
    }
    return res
}

function get_best_sample(seeds,samples,w,h,walls=false){
    let best_index = 0
    let biggest_min = 0
    for(let i=0;i<samples.length;i++){
        let seeds_cost = []
        for(let j= 0;j<seeds.length;j++){
            const d = geom.distance(samples[i],seeds[j])
            seeds_cost.push(d)
        }
        if(walls){
            seeds_cost.push(geom.walls_distance(samples[i],w,h))
        }
        const min_dist = Math.min(...seeds_cost)
        if(min_dist > biggest_min){
            best_index = i
            biggest_min = min_dist
        }
    }
    //console.log(`biggest_min = ${biggest_min}`)
    return samples[best_index]
}

function get_best_path_sample(seeds,samples,path_points){
    let best_index = 0
    let biggest_min = 0
    for(let i=0;i<samples.length;i++){
        let seeds_cost = []
        for(let j= 0;j<seeds.length;j++){
            const d = geom.distance(samples[i],seeds[j])
            seeds_cost.push(d)
        }
        for(let j= 0;j<path_points.length;j++){
            const d = geom.distance(samples[i],path_points[j])
            seeds_cost.push(d)
        }
        const min_dist = Math.min(...seeds_cost)
        if(min_dist > biggest_min){
            best_index = i
            biggest_min = min_dist
        }
    }
    //console.log(`biggest_min = ${biggest_min}`)
    return samples[best_index]
}

function get_closest_index(seeds,coord){
    let index_of_closest = 0
    let closest_dist = Number.MAX_VALUE
    for(let i=0;i<seeds.length;i++){
        const d = geom.distance(coord,seeds[i])
        if(d < closest_dist){
            index_of_closest = i
            closest_dist = d
        }
    }
    return index_of_closest
}
class voronoi_app{
    constructor(parent,w,h){
        this.parent = parent
        //const use_storage = false
        let init_needed = false
        this.version = "31"
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
            this.seeds = []
            this.nb_seeds = 30;
            this.max_seeds = 50;
            this.seed_debug = 0;
            this.nb_samples = 10;
            this.gen_surface = 800*600;
            this.nb_seeds_gen = 0;
            this.walls_dist = true;
            this.sampling = true;
            this.path_width = 2;
            this.min_edge = 20
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
                seeds:false
            }
        }
        this.svg = {}
        this.svg.seeds = []
        this.svg.main = html(parent,"svg",/*html*/`<svg id="main_svg" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"></svg>`);
        svg.set_parent(this.svg.main)
        this.svg.path = null;
        this.svg.seeds_area = null;
        this.svg.cells = [];

        this.diagram = new voronoi_diag()

        this.init_events()
    }
    
    change_parent(new_parent,width,height){
        this.svg.main.parentElement.removeChild(this.svg.main)
        new_parent.appendChild(this.svg.main)
        this.svg.main.setAttributeNS(null,"width",width)
        this.svg.main.setAttributeNS(null,"height",height)
    }

    get_seed(id,w,h){
        let samples = get_seed_samples(this.nb_samples,w,h)
        //console.log(samples)
        const best_seed = get_best_sample(this.seeds,samples,w,h,this.walls_dist)
        return {
            id:id,
            x:best_seed.x,
            y:best_seed.y
        }
    }
    get_point_inside(box,path_id){
        let x,y
        let max_iter = 100
        let inside = false
        while((!inside)&&(max_iter>0)){
            x = box.x + Math.random()*box.width
            y = box.y + Math.random()*box.height
            if(document.elementFromPoint(x, y).id == path_id){
                inside = true
            }
            max_iter--
        }
        if(max_iter == 0){
            console.error(`can't sample in path : max iterations 100 reached`)
        }
        return [x,y]
    }
    get_samples_inside_path(box){
        let res = []
        for(let i=0;i<this.nb_samples;i++){
            let [x,y] = this.get_point_inside(box,"seeds_area")
            res.push({x:x,y:y})
        }
        return res
    }
    add_seeds_in_area(nb){
        const box = this.svg.seeds_area.getBoundingClientRect();
        for(let i=0;i<nb;i++){
            let samples = this.get_samples_inside_path(box)
            let best = get_best_path_sample(this.seeds,samples,this.path_points)
            //check the cost
            const s = {
                id:i,
                x:best.x,
                y:best.y
            }
            this.seeds.push(s)
        }
    }
    add_seeds_sampling(nb){
        const prev_nb = this.seeds.length
        for(let i=0;i<nb;i++){
            const new_id = prev_nb+i
            const s = this.get_seed(new_id,this.width,this.height)
            this.seeds.push(s)
        }
    }
    add_seeds_random(nb){
        const prev_nb = this.seeds.length
        const new_seeds = get_seeds(nb,this.width,this.height)
        for(let i=0;i<nb;i++){
            const s = new_seeds[i]
            const new_id = prev_nb+i
            this.seeds.push({id:new_id,x:s.x,y:s.y})
        }
    }
    update_seeds(clear=false){
        console.time("update_seeds")
        if(clear===true){
            this.seeds = []
        }else{
            for(let i=0;i<this.seeds.length;i++){
                if(this.seed_outside(this.seeds[i])){
                    this.seeds.splice(i,1)
                    i--
                }
            }
        }
        if(this.nb_seeds < this.seeds.length){
            const nb_pop = this.seeds.length - this.nb_seeds
            for(let i=0;i<nb_pop;i++){
                this.seeds.pop()
            }
        }else if(this.nb_seeds > this.seeds.length){
            const nd_seeds_to_add = this.nb_seeds - this.seeds.length
            if(this.svg.seeds_area != null){
                this.add_seeds_in_area(nd_seeds_to_add)
            }else{
                if(this.sampling){
                    this.add_seeds_sampling(nd_seeds_to_add)
                }else{
                    this.add_seeds_random(nd_seeds_to_add)
                }
            }
        }
        const new_gen_surface = this.width * this.height
        const win_seeds = Math.round((this.nb_seeds * (((new_gen_surface-this.gen_surface) / this.gen_surface))))
        //console.log(`won seeds ${win_seeds} (${new_gen_surface} / ${this.gen_surface})`)
        if(clear){
            this.gen_surface = this.width * this.height
            this.nb_seeds_gen = this.nb_seeds
        }else{
            //if((win_seeds>0)&&(Math.abs(win_seeds) < this.nb_seeds * 2)){
            if(Math.abs(win_seeds) < this.nb_seeds){
                    //this.nb_seeds = this.nb_seeds_gen + win_seeds
            }
        }
        for(let i=0;i<this.seeds.length;i++){
            this.seeds[i].id = i
            }
        console.timeEnd("update_seeds")
        this.compute_voronoi()
    }
    set_seeds(seeds){
        this.seeds = seeds
        this.nb_seeds = this.seeds.length
        this.compute_voronoi()
    }
    add_seed(coord){
        const new_id = this.seeds[this.seeds.length-1].id + 1
        let s = {x:coord.x, y:coord.y, id:new_id}
        this.seeds.push(s)
        this.compute_voronoi()
    }
    remove_seed(coord){
        const closest = get_closest_index(this.seeds,coord)
        const seed_id = this.seeds[closest].id
        this.seeds.splice(closest,1)
        this.compute_voronoi()
    }
    move_seed(coord){
        const closest_index = get_closest_index(this.seeds,coord)
        let closest_seed = this.seeds[closest_index]
        closest_seed.x = coord.x
        closest_seed.y = coord.y
        const seed_id = this.seeds[closest_index].id
        this.compute_voronoi()
    }
    seed_outside(coord){
        if(coord.x > this.width){
            return true
        }
        if(coord.y > this.height){
            return true
        }
        return false
    }

    draw_seeds(){
        this.svg.seeds = svg.draw_seeds(this.seeds)
    }

    draw_path(){
        console.time("draw path")
        this.svg.path = svg.draw_path(this.res.edges,this.path_width)
        console.timeEnd("draw path")
    }

    set_path_width(width){
        this.path_width = width
        this.svg.path.setAttributeNS(null,"stroke-width",width)
        this.store()
    }

    draw_cells(){
        console.time("draw cells")
        //todo select color checkbox true false
        const props = {
            shape:this.cells_shape,
            color:this.is_color,
            min_edge:this.min_edge,
            retraction:this.cells_space,
            debug:this.seed_debug
        }
        this.svg.cells = svg.draw_cells(this.diagram,props)
        console.timeEnd("draw cells")
    }

    clear_svg(){
        let children = [ ...this.svg.main.children];
        children.forEach((child)=>{
            child.parentElement.removeChild(child)
        })
    }

    draw(){
        this.clear_svg()
        if(this.view_svg.cells){
            this.draw_cells()
        }
        if(this.view_svg.edges){
            this.draw_path()
        }
        if(this.view_svg.seeds){
            this.draw_seeds()
        }
        if(this.svg.seeds_area != null){
            this.svg.main.appendChild(this.svg.seeds_area)
        }
        this.store()
    }

    store(){
        let config = Object.assign({},this)
        delete config.parent
        delete config.svg
        delete config.seeds
        delete config.res
        delete config.diagram
        //console.log(`storing config version ${config.version}`)
        localStorage.setItem("voronoi_config",JSON.stringify(config))
    }

    compute_voronoi(){
        this.diagram.compute(this.seeds,{xl:0, xr:parseFloat(this.width), yt:0, yb:parseFloat(this.height)})
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
        this.update_seeds(clear)
    }


    save_svg(fileName){
        this.clear_svg()
        if(this.export_svg.seeds){
            this.draw_seeds()
        }
        if(this.export_svg.edges){
            this.draw_path()
        }
        if(this.export_svg.cells){
            this.draw_cells()
        }
        if(this.export_ratio != 1.0){
            this.svg.main.setAttributeNS(null,"transform",`scale(${this.export_ratio})`)
        }
        svg.save(fileName)
        if(this.export_ratio != 1.0){
            this.svg.main.setAttributeNS(null,"transform","")
        }
        this.draw()
    }

    save_seeds(fileName){
        this.seeds.forEach((s)=>{
            delete s.voronoiId
        })
        save_json(this.seeds,fileName)
    }

    compute_path_points(){
        const p = this.svg.seeds_area
        const nb_steps = 20
        const step = p.getTotalLength() / nb_steps
        this.path_points = []
        for(let i=0;i<nb_steps;i++){
            let dist = step * i
            this.path_points.push(p.getPointAtLength(dist))
        }
    }
    load_dropped_svg(reader){
        console.log("svg dropped")
        let is_valid = false;
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
                vor_context.svg.seeds_area = path
                vor_context.svg.main.appendChild(path)
                path.setAttributeNS(null,"fill-opacity",0.2)
                path.setAttributeNS(null,"fill","#115522")
                path.id = "seeds_area"
                vor_context.compute_path_points()
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
                vor_context.set_seeds(result)
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
                this.add_seed({x:e.clientX, y:e.clientY})
            }else if(this.mouse_action == "remove"){
                this.remove_seed({x:e.clientX, y:e.clientY})
            }
        })
        $(this.svg.main).mousemove((e)=>{
            if(this.mouse_action == "move"){
                if(e.buttons == 1){
                    this.move_seed({x:e.clientX, y:e.clientY})
                }
            }
        })
        $(this.svg.main).mousedown((e)=>{
            if(this.mouse_action == "move"){
                this.move_seed({x:e.clientX, y:e.clientY})
            }
        })
    }
}


export {voronoi_app};
