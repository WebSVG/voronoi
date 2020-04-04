import {input_range,input_text,button,br,cols} from "./utils.js"
import {Voronoi} from "./index.js"

const b = document.body
const default_nb_seeds = 50;



function main(){

    let vor = new Voronoi(b)
    let seeds_cols = cols(b,2)
    let seeds_btn = button(seeds_cols[0],"btn_seed",`generate seeds`,`${default_nb_seeds}`);
    let seeds_intxt = input_text(seeds_cols[0],"text_nb_seed",`${default_nb_seeds}`);
    let rg_seeds = input_range(seeds_cols[1],default_nb_seeds * 2)
 
    seeds_btn.addEventListener("click",(e)=>{
        vor.remove_seeds()
        vor.add_seeds_random(rg_seeds.value)
    })
    rg_seeds.addEventListener("input",(e)=>{
        seeds_intxt.value = rg_seeds.value
        vor.adjust_seeds(rg_seeds)
    })
}

main();
