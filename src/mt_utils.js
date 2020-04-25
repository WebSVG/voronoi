import {html,temp} from "./web-js-utils.js"

class Materialize_p{

    columns(parent,nb_cols,props=null){
        let contaienr = html(parent,/*html*/`<div class="container"></div>`)
        let section = html(contaienr,/*html*/`<div class="section"></div>`)
        let row = html(section,/*html*/`<div class="row"></div>`)
    
        let cols = []
        for(let i=0;i<nb_cols;i++){
            cols.push(html(row,/*html*/`<div class="col s12 m4"></div>`))
        }
        return cols
    }

}


class Materialize{

    columns(cols,props=null){
        let template = document.createElement("template")
        let container = html(template,/*html*/`<div class="container"></div>`)
        let section = html(container,/*html*/`<div class="section"></div>`)
        let row = html(section,/*html*/`<div class="row"></div>`)
    
        for(let i=0;i<cols.length;i++){
            let col = html(row,/*html*/`<div class="col s12 m4"></div>`)
            col.appendChild(cols[i])
        }
        return container
    }

    button(label){
        return temp(/*html*/`<div class="row center">
            <a class="btn-large waves-effect waves-light orange">${label}</a>
        </div>`)
    }
}

export{Materialize,Materialize_p}
