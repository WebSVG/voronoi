import {input_range,input_text,button,br,cols,toggle} from "./utils.js"
import {Voronoi} from "./index.js"

const b = document.body
const default_nb_seeds = 50;



function main(){

    let vor = new Voronoi(b)
    let seeds_cols = cols(b,2)
    let toggle_alg = toggle(seeds_cols[0],"Sampling","Random")
    console.log(toggle_alg.tagName)
    let toggle_walls = toggle(seeds_cols[0],"Walls","Ignore")
    let seeds_btn = button(seeds_cols[0],"btn_seed",`generate seeds`,`${default_nb_seeds}`);
    let seeds_intxt = input_text(seeds_cols[0],"text_nb_seed",`${default_nb_seeds}`);
    let rg_seeds = input_range(seeds_cols[1],default_nb_seeds * 2)
 

    vor.sampling = true
    //not working because of bootstrap
    toggle_alg.addEventListener("change",()=>{vor.sampling = toggle_alg.checked;console.log(vor.sampling)})
    vor.walls_dist = true
    //not working because of bootstrap
    toggle_walls.addEventListener("change",()=>{vor.walls_dist = toggle_walls.checked})

    seeds_btn.addEventListener("click",(e)=>{
        vor.sampling = toggle_alg.checked;
        vor.walls_dist = toggle_walls.checked
        vor.remove_seeds()
        vor.adjust_seeds(rg_seeds.value,toggle_alg.checked)
    })
    rg_seeds.addEventListener("input",(e)=>{
        vor.sampling = toggle_alg.checked;
        vor.walls_dist = toggle_walls.checked
        seeds_intxt.value = rg_seeds.value
        vor.adjust_seeds(rg_seeds.value,toggle_alg.checked)
    })
}

main();
