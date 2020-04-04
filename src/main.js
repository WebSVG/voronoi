import {input_range,input_text,button,br,cols,toggle,html} from "./utils.js"
import {Voronoi} from "./index.js"

const b = document.body
const default_nb_seeds = 50;
const nb_samples = 10


function main(){

    let vor = new Voronoi(b)
    let seeds_cols = cols(b,3)
    html(seeds_cols[0],"a",/*html*/`<a style="margin:10px">Max Distance</a>`)
    let toggle_alg = toggle(seeds_cols[0],"Sampling","Single")
    let in_sampling = input_text(seeds_cols[0],"in_nb_samples",`${nb_samples} samples`);
    let toggle_walls = toggle(seeds_cols[0],"walls away","walls stick")
    //br(seeds_cols[0])
    let seeds_btn = button(seeds_cols[1],"btn_seed",`generate seeds`,`${default_nb_seeds}`);
    let seeds_intxt = input_text(seeds_cols[1],"in_nb_seed",`${default_nb_seeds} seeds`);
    let rg_seeds = input_range(seeds_cols[2],default_nb_seeds * 2)
    let seeds_max = input_text(seeds_cols[2],"in_max_seed",`max seeds ${default_nb_seeds*2}`,"w-100");
 

    vor.sampling = true
    //not working because of bootstrap
    toggle_alg.addEventListener("change",()=>{vor.sampling = toggle_alg.checked})
    vor.walls_dist = true
    //not working because of bootstrap
    toggle_walls.addEventListener("change",()=>{vor.walls_dist = toggle_walls.checked})

    seeds_btn.addEventListener("click",(e)=>{
        vor.sampling = toggle_alg.checked;
        vor.walls_dist = toggle_walls.checked
        vor.adjust_nb_seeds(rg_seeds.value,true)
    })
    rg_seeds.addEventListener("input",(e)=>{
        vor.sampling = toggle_alg.checked;
        vor.walls_dist = toggle_walls.checked
        seeds_intxt.value = rg_seeds.value
        vor.adjust_nb_seeds(rg_seeds.value,false)
    })
    seeds_intxt.addEventListener("change",()=>{rg_seeds.value = seeds_intxt.value})
    seeds_max.addEventListener("change",()=>{rg_seeds.max = seeds_max.value})
    vor.nb_samples = nb_samples
    in_sampling.addEventListener("change",()=>{vor.nb_samples = in_sampling.value})
}

main();
