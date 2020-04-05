function defined(obj){
    return (typeof(obj) != "undefined")
}

function attributes(parent,tagName,attributes){
    const xmlns = "http://www.w3.org/2000/svg";
    let element = document.createElementNS(xmlns,tagName);
    for(let [key, value] of Object.entries(attributes)){
        element.setAttributeNS(null,key,value);
    }
    parent.appendChild(element);
    return element;
}

function html(parent,tagName,svg_text){
    parent.insertAdjacentHTML("beforeend",svg_text);
    let elements = parent.getElementsByTagName(tagName);
    let res_svg =  elements[elements.length-1];
    return res_svg;
}

function circle(parent,x,y,id){

    return html(parent,"circle",
    /*html*/`<circle id=${id} cx=${x} cy=${y} r="3" stroke="black" stroke-width="3" fill="red" />`
    );
}

function draw_path(parent,edges){
    let d = ""
    edges.forEach((e)=>{
        d = d + `M ${e.va.x} ${e.va.y} L ${e.vb.x} ${e.vb.y} `
    })
    return html(parent,"path",
    /*html*/`<path d="${d}" stroke="black" stroke-width="2" />`
    )

}

function button(parent,id,Text){
    return html(parent,"button",
    /*html*/`<button id=${id} type="button" class="btn btn-primary" style="margin:10px">${Text}</button>`
    )
}

function button_input(parent,id,Text,input){
    return html(parent,"div",
    /*html*/`   <div class="input-group mb-3">
                <div class="input-group-prepend">
                <button class="btn btn-primary" type="button" id="button-addon1">${Text}</button>
                </div>
                <input id=${id} type="text" placeholder="seeds number" aria-label="Example text with button addon" aria-describedby="button-addon1">
                </div>`
    )
}

function input_text(parent,id,placeholder,width="w-25"){
    let input_txt = html(parent,"input",
    /*html*/`   <input id=${id} type="text" class="form-group ${width}" placeholder="${placeholder}" aria-label="Example text with button addon" aria-describedby="button-addon1">`
    )
    //input_txt.value = input
    return input_txt
}

function input_range(parent,max){
    return html(parent,"input",
    /*html*/`<input type="range" class="custom-range" id="customRange1" max=${max} >`)
}

function cols(parent,nb_cols){
    let contaienr = html(parent,"div",/*html*/`<div class="container"></div>`)
    let row = html(contaienr,"div",/*html*/`<div class="row"></div>`)

    let cols = []
    for(let i=0;i<nb_cols;i++){
        cols.push(html(row,"div",/*html*/`<div class="col"></div>`))
    }
    return cols
}

//classes : ml-1
function toggle(parent,on="On",off="Off"){
    return html(parent,"input",
    /*html*/`<input type="checkbox" class="ml-1" data-height="20" checked data-toggle="toggle" data-on="${on}" data-off="${off}" >`)
}

function br(parent){
    parent.appendChild(document.createElement("br"))
}

function hr(parent){
    parent.appendChild(document.createElement("hr"))
}

//mini jQuery like events wrapper
class Events{
    constructor(){
        const events_list = ["click","change","input"]
        events_list.forEach((evtName)=>{
            this[evtName] = (element,func)=> {
                element.addEventListener(evtName,func)
            }
        })
    }
}

function save_svg(svg,fileName){
    let s = new XMLSerializer();
    const svg_str = s.serializeToString(svg);
    var blob = new Blob([svg_str], {type: 'image/svg+xml'});
    saveAs(blob, fileName);
}

function save_json(object,fileName){
    const json_str = JSON.stringify(object,null,'\t');
    var blob = new Blob([json_str], {type: 'application/json'});
    saveAs(blob, fileName);
}

export{
    attributes,
    html,
    circle,
    draw_path,
    button,
    button_input,
    input_range,
    input_text,
    toggle,
    cols,
    br,hr,
    Events,
    save_svg,
    save_json,
    defined
}
