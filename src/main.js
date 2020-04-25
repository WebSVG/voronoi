import {hr,html, br,temp} from "./web-js-utils.js"
import {voronoi_app} from "./voronoi_app.js"

import {Materialize,Materialize_p} from "./mt_utils.js"

let mt = new Materialize()
let mtp = new Materialize_p()

const b = document.body
let vor = new voronoi_app()

$(document).ready(()=>{
    vor.update_size(true)
})
$(window).resize(()=>{
    vor.resize(100,80)
})

function main(){

    let btn_seeds = temp(/*html*/`<div class="row center">
        <a id="download-button" class="btn-large waves-effect waves-light orange">Randomize</a>
        </div>`)
    $(btn_seeds).click((e)=>{
        vor.update_seeds({clear:true})//clear = true
    })

    let cols = mt.columns([vor.element(),btn_seeds])
    vor.resize(100,80)

    b.appendChild(cols)
}



main();

