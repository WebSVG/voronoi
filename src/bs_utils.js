
import {html} from "./utils.js"

class Bootstrap{
    button(parent,id,Text){
        return html(parent,"button",
        /*html*/`<button id=${id} type="button" class="btn btn-primary" style="margin:10px">${Text}</button>`
        )
    }
    
    button_input(parent,id,Text,input){
        return html(parent,"div",
        /*html*/`   <div class="input-group mb-3">
                    <div class="input-group-prepend">
                    <button class="btn btn-primary" type="button" id="button-addon1">${Text}</button>
                    </div>
                    <input id=${id} type="text" placeholder="seeds number" aria-label="Example text with button addon" aria-describedby="button-addon1">
                    </div>`
        )
    }
    
    input_text(parent,id,placeholder,width="w-25"){
        let input_txt = html(parent,"input",
        /*html*/`   <input id=${id} type="text" class="form-group ${width}" placeholder="${placeholder}" aria-label="Example text with button addon" aria-describedby="button-addon1">`
        )
        //input_txt.value = input
        return input_txt
    }
    
    input_range(parent,max){
        return html(parent,"input",
        /*html*/`<input type="range" class="custom-range" max=${max} >`)
    }
    
    cols(parent,nb_cols,props=null){
        let contaienr = html(parent,"div",/*html*/`<div class="container"></div>`)
        let row = html(contaienr,"div",/*html*/`<div class="row"></div>`)
    
        let cols = []
        for(let i=0;i<nb_cols;i++){
            cols.push(html(row,"div",/*html*/`<div class="${(props==null)?"col":props[i]}"></div>`))
        }
        return cols
    }
    
    dropdown(parent,dropdown_label,droplist,dropitems,callback){
        let dropdown = html(parent,"div",/*html*/`<div class="dropdown"></div>`)
        let button = html(dropdown,"button",/*html*/`
            <button class="btn btn-primary dropdown-toggle w-100 m-1" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                ${dropdown_label}
            </button>`)
        let dropdown_menu = html(dropdown,"div",/*html*/`<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        </div>`)
    
        for(let i=0;i<droplist.length;i++){
            let item = html(dropdown_menu,"a",/*html*/`<a class="dropdown-item" data-label="${droplist[i]}">${dropitems[i]}</a>`)
            $(item).click(callback)
        }
        return dropdown
    }
    
    //classes : ml-1
    toggle(parent,on="On",off="Off"){
        return html(parent,"input",
        /*html*/`<input type="checkbox" class="m-1" data-height="20" checked data-toggle="toggle" data-on="${on}" data-off="${off}" >`)
    }
    
    radio_group(parent,name,labels_list,nb_checked,callback=null){
        let res = []
        for(let i=0;i<labels_list.length;i++){
            const label = labels_list[i]
            let element = html(parent,"div",
            /*html*/`<div class="custom-control custom-radio">
                        <input type="radio" data-label="${label}" class="custom-control-input" id="rg_${label}" name="rg_${name}" ${(i==nb_checked)?"checked":""} >
                        <label class="custom-control-label" for="rg_${label}">${label}</label>
                    </div>`
            )
            if(callback != null){
                $(element).change(callback)
            }
            res.push(element)
        }
        return res
    }
    
    checkbox_group(parent,name,labels_list,checked_list,callback){
        for(let i=0;i<labels_list.length;i++){
            const label = labels_list[i]
            let element = html(parent,"div",
            /*html*/`<div class="custom-control custom-checkbox">
                        <input type="checkbox" data-name="${label}" class="custom-control-input" id="cb_${name}_${label}" name="${name}" ${(checked_list[i])?"checked":""}>
                        <label class="custom-control-label" for="cb_${name}_${label}">${label}</label>
                    </div>`
            )
            $(element).change(callback)
        }
    }
    
}



export{Bootstrap}
