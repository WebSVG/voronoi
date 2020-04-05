import {defined,html,circle,circle_move,draw_path,draw_cells,save_json,draw_cells_bezier} from "./utils.js"
import * as vor_core from "../libs/rhill-voronoi-core.js"

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

function walls_distance(seed,w,h){
    let walls_dist = []
    walls_dist.push(Math.abs(seed.x))
    walls_dist.push(Math.abs(seed.y))
    walls_dist.push(Math.abs(w-seed.x))
    walls_dist.push(Math.abs(h-seed.y))
    return Math.min(...walls_dist)
}

function distance(s1,s2){
    const dx = s1.x-s2.x
    const dy = s1.y-s2.y
    return Math.sqrt(dx * dx + dy * dy)
}

function get_best_sample(seeds,samples,w,h,walls=false){
    let best_index = 0
    let biggest_min = 0
    for(let i=0;i<samples.length;i++){
        let seeds_cost = []
        for(let j= 0;j<seeds.length;j++){
            const d = distance(samples[i],seeds[j])
            seeds_cost.push(d)
        }
        if(walls){
            seeds_cost.push(walls_distance(samples[i],w,h))
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
        const d = distance(coord,seeds[i])
        if(d < closest_dist){
            index_of_closest = i
            closest_dist = d
        }
    }
    return index_of_closest
}
class Voronoi{
    constructor(parent){
        this.seeds = []
        this.svg_seeds = []
        this.svg = html(parent,"svg",
        /*html*/`<svg id="main_svg" xmlns="http://www.w3.org/2000/svg" width="100%" height=75%></svg>`
        );
        html(this.svg,"rect",
        /*html*/`<rect width="100%" height="100%" style="fill:rgb(255,250,245)"></rect>`
        );
        this.nb_samples = 10;
        this.walls_dist = false;
        this.sampling = false;
        this.path = null;
        this.cells = null;
        this.seeds_visible = true;
        this.mouse_action = "nothing"
        this.init_events()
    }
    
    clear_seeds(clear_array=true,clear_svg_array=true){
        if(clear_array){
            this.seeds = []
        }
        if(clear_svg_array){
            this.svg_seeds.forEach((el)=>{
                if(el.parentElement != null){//not understood why needed
                    el.parentElement.removeChild(el)
                }
            })
            this.svg_seeds = []
        }
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

    add_seeds_sampling(nb){
        const w = this.svg.width.baseVal.value
        //issue not full height
        const h = this.svg.height.baseVal.value
        //console.log(`seeding in w:${w} ; h:${h}`)
        const prev_nb = this.seeds.length
        //const new_seeds = get_seeds(nb,w,h)
        for(let i=0;i<nb;i++){
            const new_id = prev_nb+i
            const s = this.get_seed(new_id,w,h)
            this.seeds.push(s)
            let c = circle(this.svg,s.x,s.y,`c_${new_id}`)
            this.svg_seeds.push(c)
        }
    }

    add_seeds_random(nb){
        const w = this.svg.width.baseVal.value
        //issue not full height
        const h = this.svg.height.baseVal.value
        //console.log(`seeding in w:${w} ; h:${h}`)
        const prev_nb = this.seeds.length
        const new_seeds = get_seeds(nb,w,h)
        for(let i=0;i<nb;i++){
            const s = new_seeds[i]
            const new_id = prev_nb+i
            this.seeds.push({id:new_id,x:s.x,y:s.y})
            let c = circle(this.svg,s.x,s.y,`c_${new_id}`)
            this.svg_seeds.push(c)
        }
    }

    draw_path(res){
        console.time("draw path")
        if(this.path != null){
            this.svg.removeChild(this.path)
        }
        this.path = draw_path(this.svg,res.edges)
        console.timeEnd("draw path")
    }

    draw_cells(res){
        console.time("draw cells")
        if(this.cells != null){
            this.cells.forEach((c)=>{
                c.parentElement.removeChild(c)
            })
        }
        //todo select color checkbox true false
        this.cells = draw_cells_bezier(this.svg,res.cells)
        console.timeEnd("draw cells")
    }

    compute_voronoi(){
        console.time("voronoi")
        let voronoi = new vor_core.Voronoi()
        const w = this.svg.width.baseVal.value
        const h = this.svg.height.baseVal.value
        let res = voronoi.compute(this.seeds,{xl:0, xr:w, yt:0, yb:h})
        console.timeEnd("voronoi")
        //console.log(`stats : ${res.cells.length} cells , ${res.vertices.length} vertices , ${res.edges.length} edges`)
        this.draw_path(res)
        this.draw_cells(res)
    }

    run(nb,clear=false){
        if(clear){
            this.clear_seeds()
        }
        const nb_samples = this.sampling?nb*this.nb_samples:nb
        const walls_msg = this.sampling?this.walls_dist:"irrelevant"
        console.log(`generating ${nb} seeds ; sampling=${this.sampling} ; walls=${walls_msg} : ${nb_samples} samples`)
        console.time("adjust_seeds")
        if(nb < this.seeds.length){
            const nb_pop = this.svg_seeds.length - nb
            for(let i=0;i<nb_pop;i++){
                this.seeds.pop()
                let last = this.svg_seeds.pop()
                this.svg.removeChild(last)
            }
        }else if(nb > this.seeds.length){
            if(this.sampling){
                this.add_seeds_sampling(nb - this.svg_seeds.length)
            }else{
                this.add_seeds_random(nb - this.svg_seeds.length)
            }
            this.view_seeds()
        }
        console.timeEnd("adjust_seeds")
        this.compute_voronoi()
    }

    set_seeds(seeds){
        this.clear_seeds()
        this.seeds = seeds
        for(let i=0;i<seeds.length;i++){
            const s = seeds[i]
            this.svg_seeds.push( circle(this.svg,s.x,s.y,`c_${s.id}`) )
        }
        this.compute_voronoi()
    }

    add_seed(coord){
        const new_id = this.seeds[this.seeds.length-1].id + 1
        let s = {x:coord.x, y:coord.y, id:new_id}
        this.seeds.push(s)
        this.svg_seeds.push(circle(this.svg,s.x,s.y,`c_${s.id}`))
        this.compute_voronoi()
    }

    remove_seed(coord){
        const closest = get_closest_index(this.seeds,coord)
        const seed_id = this.seeds[closest].id
        this.seeds.splice(closest,1)
        const svg_seed_list = $(`#c_${seed_id}`)
        if(svg_seed_list.length != 1){
            console.log(`'#c_${seed_id}' returned ${svg_seed_list.length} entries`)
        }
        const svg_seed = svg_seed_list[0]
        svg_seed.parentElement.removeChild(svg_seed)
        this.compute_voronoi()
    }

    move_seed(coord){
        const closest_index = get_closest_index(this.seeds,coord)
        let closest_seed = this.seeds[closest_index]
        closest_seed.x = coord.x
        closest_seed.y = coord.y
        const seed_id = this.seeds[closest_index].id
        const svg_seed = $(`#c_${seed_id}`)[0]
        circle_move(svg_seed,coord)
        this.compute_voronoi()
    }

    view_seeds(visible=null){
        if(visible != null){
            this.seeds_visible = visible
        }
        this.svg_seeds.forEach((seed)=>{
            if(this.seeds_visible){
                seed.setAttributeNS(null,"visibility","visible")
            }else{
                seed.setAttributeNS(null,"visibility","hidden")
            }
        })
    }

    save_seeds(fileName){
        this.seeds.forEach((s)=>{
            delete s.voronoiId
        })
        save_json(this.seeds,fileName)
    }

    load_dropped_seeds(file){
        let extension = file.name.split('.').pop();
        var reader = new FileReader();
        let is_valid = false;
        const vor_context = this
        if(extension == "json"){
            console.log("extention check - OK")
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
        else{
            alert(`unsupported file format`);
        }
        reader.readAsText(file);
    }

    init_events(){
        $(this.svg).click((e)=>{
            if(this.mouse_action == "add"){
                this.add_seed({x:e.clientX, y:e.clientY})
            }else if(this.mouse_action == "remove"){
                this.remove_seed({x:e.clientX, y:e.clientY})
            }
        })
        $(this.svg).mousemove((e)=>{
            if(this.mouse_action == "move"){
                if(e.buttons == 1){
                    this.move_seed({x:e.clientX, y:e.clientY})
                }
            }
        })
        $(this.svg).mousedown((e)=>{
            if(this.mouse_action == "move"){
                this.move_seed({x:e.clientX, y:e.clientY})
            }
        })
    }
}


export {
    Voronoi
    };
