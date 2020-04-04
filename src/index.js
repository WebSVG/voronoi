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

function get_seed_samples(w,h){
    let res = []
    for(let i = 0;i<nb; i++){
        res.push({
            x:Math.round(Math.random()*w),
            y:Math.round(Math.random()*h)
        })
    }
    return res
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

    add_seed(id){
        let samples = get_seed_samples()
        let best = get_best_sample(this.seeds,samples)
        this.seeds.push({
            id:id,
            x:Math.round(Math.random()*w),
            y:Math.round(Math.random()*h)
        })
    }

    add_seeds_sampling(nb){
        const w = this.svg.width.baseVal.value
        //issue not full height
        const h = this.svg.height.baseVal.value
        console.log(`seeding in w:${w} ; h:${h}`)
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

    add_seeds_random(nb){
        const w = this.svg.width.baseVal.value
        //issue not full height
        const h = this.svg.height.baseVal.value
        console.log(`seeding in w:${w} ; h:${h}`)
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

    adjust_seeds(r_seeds){
        if(r_seeds.value < this.svg_seeds.length){
            console.log("remove")
            const nb_pop = this.svg_seeds.length - r_seeds.value
            for(let i=0;i<nb_pop;i++){
                this.seeds.pop()
                let last = this.svg_seeds.pop()
                this.svg.removeChild(last)
            }
        }else if(r_seeds.value > this.svg_seeds.length){
            this.add_seeds_random(r_seeds.value - this.svg_seeds.length)
        }
    }
}


export {
    Voronoi
    };
