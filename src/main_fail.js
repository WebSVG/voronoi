import {hr,html, br,temp} from "./web-js-utils.js"
import {voronoi_app} from "./voronoi_app.js"

import {Materialize,Materialize_p} from "./mt_utils.js"
import { Grid } from "./scale-grid.js"

let mt = new Materialize()
let mtp = new Materialize_p()

const b = document.body
let vor = new voronoi_app()

$(document).ready(()=>{
    vor.update_size(true)
})
$(window).resize(()=>{
    vor.resize(100,100)
})

function main(){


    let btn_seeds = mt.button("Randomize")
    $(btn_seeds).click((e)=>{
        vor.update_seeds({clear:true})//clear = true
    })

    vor.resize(100,50)

    let grid = new Grid(b,500)
    let d1 = grid.get_div({width:500,height:400,r:255,g:255,b:255})
    let d2 = grid.get_div({width:200,height:100,r:255,g:255,b:255})
    d1.appendChild(vor.element())
    d2.appendChild(btn_seeds)

    grid.apply()
    //let cols = mt.columns([vor.element(),btn_seeds])
    //b.appendChild(cols)

}



main();

