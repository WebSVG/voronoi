import {html,circle,} from "./utils.js"

function get_seeds(nb,w,h){
    let res = []
    for(let i = 0;i<nb; i++){
        res.push({
            id:i,
            x:Math.round(Math.random()*w),
            y:Math.round(Math.random()*h)
        })
    }
    return res
}

function get_seed_samples(nb,w,h){
    let res = []
    for(let i = 0;i<nb; i++){
        res.push({
            x:Math.round(Math.random()*w),
            y:Math.round(Math.random()*h)
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
class Voronoi{
    constructor(parent){
        this.seeds = []
        this.svg_seeds = []
        this.svg = html(parent,"svg",
        /*html*/`<svg id="main_svg" xmlns="http://www.w3.org/2000/svg" width="100%" height=80%></svg>`
        );
        html(this.svg,"rect",
        /*html*/`<rect width="100%" height="100%" style="fill:rgb(255,250,245)"></rect>`
        );
        this.nb_samples = 10;
        this.walls_dist = false;
        this.sampling = false;
    }
    remove_seeds(){
        this.seeds = []
        this.svg_seeds.forEach((el)=>{
            if(el.parentElement != null){//not understood why needed
                el.parentElement.removeChild(el)
            }
        })
        this.svg_seeds = []
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

    adjust_seeds(nb){
        const nb_samples = this.sampling?nb*this.nb_samples:nb
        const walls_msg = this.sampling?this.walls_dist:"irrelevant"
        console.log(`generating ${nb} seeds ; sampling=${this.sampling} ; walls=${walls_msg} : ${nb_samples} samples`)
        console.time("adjust_seeds")
        if(nb < this.svg_seeds.length){
            const nb_pop = this.svg_seeds.length - nb
            for(let i=0;i<nb_pop;i++){
                this.seeds.pop()
                let last = this.svg_seeds.pop()
                this.svg.removeChild(last)
            }
        }else if(nb > this.svg_seeds.length){
            if(this.sampling){
                this.add_seeds_sampling(nb - this.svg_seeds.length)
            }else{
                this.add_seeds_random(nb - this.svg_seeds.length)
            }
        }
        console.timeEnd("adjust_seeds")
    }
}


export {
    Voronoi
    };