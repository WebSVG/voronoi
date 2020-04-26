import { defined,html,save_json,send} from "./web-js-utils.js"
import {Svg} from "./svg_utils.js"
import {Geometry} from "./geometry.js"

let geom = new Geometry()
let svg = new Svg()

function samples_in_rect(nb,w,h){
    let res = []
    for(let i = 0;i<nb; i++){
        res.push({
            x:Math.random()*w,
            y:Math.random()*h
        })
    }
    return res
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

function neighbors_walls_path_cost(sample,seeds,w,h,walls,path_points){
    let free_dist = []
    for(let j= 0;j<seeds.length;j++){
        free_dist.push(geom.distance(sample,seeds[j]))
    }
    if(walls){
        free_dist.push(geom.walls_distance(sample,w,h))
    }
    for(let j= 0;j<path_points.length;j++){
        free_dist.push(geom.distance(sample,path_points[j]))
    }
    const min_free_dist = Math.min(...free_dist)
    return ((min_free_dist < 1)?10000:(100.0/min_free_dist))
}

function neighbors_walls_cost(sample,seeds,w,h,walls){
    let free_dist = []
    for(let j= 0;j<seeds.length;j++){
        free_dist.push(geom.distance(sample,seeds[j]))
    }
    if(walls){
        free_dist.push(geom.walls_distance(sample,w,h))
    }
    const min_free_dist = Math.min(...free_dist)
    return ((min_free_dist < 1)?10000:(100.0/min_free_dist))
}

class Seeds{
    constructor(shape){
        this.shape = shape
        this.array = []

        this.config = {}
        this.config.is_debug = false
        this.config.debug_id = 0
        this.config.nb_seeds = 30
        this.config.max_seeds = 200
        this.config.area = {width:400,height:200}
        this.config.nb_samples = 10
        this.config.walls_dist = true
        this.config.path_debug = false
        this.config.map_vs_dist = 10
        this.config.map_vs_dist_max = 30
        this.config.map_power = 1
        this.config.map_power_range = {min:0.1,max:3,step:0.1}
    }
    //cost selection
    best_seed_path_and_cost(samples){
        const seeds = this.array
        const w = this.config.area.width
        const h = this.config.area.height
        let best_index = -1
        let best_cost = Number.MAX_VALUE;
        const use_cost_map = this.shape.use_cost_map()
        const use_cost_path = this.shape.use_cost_path()
        //console.log(samples.length)
        for(let i=0;i<samples.length;i++){
            let free_dist_cost,map_cost
            const s = samples[i]
            if(use_cost_path){
                free_dist_cost = neighbors_walls_path_cost(s,seeds,w,h,this.config.walls_dist,this.shape.path_points)
            }else{
                free_dist_cost = neighbors_walls_cost(s,seeds,w,h,this.config.walls_dist)
            }
            if(use_cost_map){
                map_cost = this.shape.get_cost(s)
                map_cost = this.config.map_vs_dist*Math.pow(map_cost,this.config.map_power)
            }else{
                map_cost = 0
            }
            const total_cost = free_dist_cost + map_cost
            //console.log(`   costs = path:${free_dist_cost.toFixed(2)} , total:${total_cost.toFixed(2)}`)
            if(total_cost < best_cost){
                best_index = i
                best_cost = total_cost
            }
        }
        //console.log(`bset dist = ${best_cost.toFixed(2)}`)
        return samples[best_index]
    }
    //sampling
    try_sample_in_path(box){
        let x,y
        let max_iter = 100
        let inside = false
        while((!inside)&&(max_iter>0)){
            x = box.x + Math.random()*box.width
            y = box.y + Math.random()*box.height
            if(geom.inside_id(x, y, this.shape.svg_path.id)){
                inside = true
            }
            max_iter--
        }
        if(max_iter == 0){
            console.error(`can't sample in path : max iterations 100 reached`)
        }
        return [x,y]
    }
    samples_in_path(box){
        let res = []
        for(let i=0;i<this.config.nb_samples;i++){
            let [x,y] = this.try_sample_in_path(box)
            res.push({x:x,y:y})
        }
        return res
    }
    add_seeds(nb){
        const w = this.config.area.width
        const h = this.config.area.height
        const inside_path = this.shape.sample_inside_path()
        let box = null
        if(inside_path){
            this.shape.append_path()
            box = this.shape.svg_path.getBoundingClientRect()
        }
        for(let i=0;i<nb;i++){
            let samples
            if(inside_path){
                samples = this.samples_in_path(box)
            }else{
                samples = samples_in_rect(this.config.nb_samples,w,h)
            }
            let best_seed = this.best_seed_path_and_cost(samples)
            this.array.push(best_seed)
        }
        if(inside_path){
            this.shape.remove_path()
        }
    }

    seed_outside_rect(coord){
        if(coord.x > this.config.area.width){
            return true
        }
        if(coord.y > this.config.area.height){
            return true
        }
        return false
    }
    check_seeds_in_rect(){
        for(let i=0;i<this.array.length;i++){
            if(this.seed_outside_rect(this.array[i])){
                this.array.splice(i,1)
                i--
            }
        }
    }
    adjust_seeds_number(){
        if(this.config.nb_seeds < this.array.length){
            const nb_pop = this.array.length - this.config.nb_seeds
            for(let i=0;i<nb_pop;i++){
                this.array.pop()
            }
        }else if(this.config.nb_seeds > this.array.length){
            const nb_seeds_to_add = this.config.nb_seeds - this.array.length
            this.add_seeds(nb_seeds_to_add)
        }
    }
    reset_seeds_id(){
        for(let i=0;i<this.array.length;i++){
            this.array[i].id = i
            }
    }


    //-----------------------------------------------------------------------------------------------
    //user add is not filtered
    add(coord){
        const new_id = this.array[this.array.length-1].id + 1
        let s = {x:coord.x, y:coord.y, id:new_id}
        this.array.push(s)
    }
    remove(coord){
        const closest = get_closest_index(this.array,coord)
        this.array.splice(closest,1)
    }
    move(coord){
        const closest_index = get_closest_index(this.array,coord)
        let closest_seed = this.array[closest_index]
        closest_seed.x = coord.x
        closest_seed.y = coord.y
    }
    update(params){
        let start = Date.now()
        if(defined(params.clear) && (params.clear == true)){
            this.array = []
        }
        if(defined(params.nb_seeds)){
            this.config.nb_seeds = params.nb_seeds
        }
        if(defined(params.nb_samples)){
            this.config.nb_samples = params.nb_samples
        }
        if(defined(params.max_seeds)){
            this.config.max_seeds = params.max_seeds
        }
        if(defined(params.walls_dist)){
            this.config.walls_dist = params.walls_dist
        }
        if(defined(params.map_vs_dist)){
            this.config.map_vs_dist = params.map_vs_dist
            send("vor_app",{type:"seeds",context:params.context})
        }
        if(defined(params.map_power)){
            this.config.map_power = params.map_power
            send("vor_app",{type:"seeds",context:params.context})
        }
        if(defined(params.width)){
            this.config.area.width = params.width
        }
        if(defined(params.height)){
            this.config.area.height = params.height
        }
        if(defined(params.config)){
            this.load_config(params.config)
        }
        if(defined(params.cell_debug)){
            this.config.path_debug = (params.cell_debug!=0)
        }
        this.check_seeds_in_rect()
        this.adjust_seeds_number()
        this.reset_seeds_id()
        let time = (Date.now()-start)
        console.log(`seeds_update: ${time.toFixed(3)} ms`)
        return time
    }

    draw(params){
        svg.set_parent(params.svg)
        if(this.array.length > 0){
            let conditional_clip_path = (this.shape.config.cells_action == "cut_off")?'clip-path="url(#cut-off-cells)"':''
            let group = html(params.svg,/*html*/`<g id="svg_g_seeds" ${conditional_clip_path}/>`)
            if(this.shape.show_inside_path()){
                this.shape.append_path()
                for(let i=0;i<this.array.length;i++){
                    const s = this.array[i]
                    if(geom.inside_id(s.x, s.y, this.shape.svg_path.id)){
                        svg.circle_p_id(group,s.x,s.y,`c_${s.id}`)
                    }
                }
                this.shape.remove_path()
            }else{
                for(let i=0;i<this.array.length;i++){
                    const s = this.array[i]
                    svg.circle_p_id(group,s.x,s.y,`c_${s.id}`)
                }
            }
        }
    }
    save(fileName){
        this.array.forEach((s)=>{
            delete s.voronoiId
        })
        const data = {window:{width:this.config.area.width,height:this.config.area.height},seeds:this.array}
        save_json(data,fileName)
    }
    load(data,params){
        if(defined(data.window) && defined(data.seeds)){
            this.array = data.seeds
            this.config.nb_seeds = this.array.length
            //this window size will be fed by from the app through window control
            send("main_window",{type:"resize",width:data.window.width,height:data.window.height})
            return true
        }else{
            if(Array.isArray(data)){
                if(data.length > 0){
                    const seed0 = data[0]
                    if((defined(seed0.x)) && (defined(seed0.y)) &&(defined(seed0.id))){
                        console.log("file structure - OK")
                        this.array = data
                        this.config.nb_seeds = this.array.length
                        send("vor_app",{type:"seeds",context:params.context})
                        return true
                    }
                }
            }
        }
        return false
    }
    get_seeds(){
        return this.array
    }

}

export{Seeds}
