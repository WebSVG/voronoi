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

function circle_move(element,coord){
    element.setAttributeNS(null,"cx",coord.x)
    element.setAttributeNS(null,"cy",coord.y)
}

function draw_path(parent,edges,width){
    let d = ""
    edges.forEach((e)=>{
        d = d + `M ${e.va.x} ${e.va.y} L ${e.vb.x} ${e.vb.y} `
    })
    return html(parent,"path",
    /*html*/`<path d="${d}" stroke="black" stroke-width="${width}" />`
    )

}

function rand_col() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
/**
 * returns the first counter clockwise point, depending if the site is the leftSite of the edge or its rightSite
 * @param {Half Edge} he 
 */
function first_ccw(he){
    return (defined(he.edge.lSite) && (he.site.id == he.edge.lSite.id))?he.edge.va:he.edge.vb
}

function center(he){
    return ({x:(he.edge.va.x+he.edge.vb.x)/2,y:(he.edge.va.y+he.edge.vb.y)/2})
}

function edge_length(he){
    const dx = he.edge.va.x-he.edge.vb.x
    const dy = he.edge.va.y-he.edge.vb.y
    return Math.sqrt(dx * dx + dy * dy)
}

function draw_cells(parent,cells,col=false){
    let res = []
    for(let i=0;i<cells.length;i++){
        const c = cells[i]
        const p = first_ccw(c.halfedges[0])
        let d = `M ${p.x} ${p.y} `
        for(let j=1;j<c.halfedges.length;j++){
            const p = first_ccw(c.halfedges[j])
            d = d + `L ${p.x} ${p.y} `
        }
        d = d + "z"
        const color = (col)?rand_col():"#221155"
        let cell_svg = html(parent,"path",
        /*html*/`<path d="${d}" stroke="black" stroke-width="0" fill="${color}" fill-opacity="0.2"/>`
        )
        res.push(cell_svg)
    }
    return res
}

function draw_cells_bezier(parent,cells,min_edge=0,col=false){
    if(cells.length<=1){
        return
    }
    let res = []
    for(let i=0;i<cells.length;i++){
        const c = cells[i]
        const Q0 = first_ccw(c.halfedges[0])
        const center0 = center(c.halfedges[0])
        let d = `M ${center0.x} ${center0.y} `
        for(let j=1;j<c.halfedges.length;j++){
            const e_length = edge_length(c.halfedges[j])
            if(e_length > min_edge){
                const Q = first_ccw(c.halfedges[j])
                const cent = center(c.halfedges[j])
                d = d + `Q ${Q.x} ${Q.y} ${cent.x} ${cent.y} `
            }
        }
        //d = d + "z"
        const e0_length = edge_length(c.halfedges[0])
        if(e0_length > min_edge){
            d = d + `Q ${Q0.x} ${Q0.y} ${center0.x} ${center0.y} `
        }
        const color = (col)?rand_col():"#221155"
        let cell_svg = html(parent,"path",
        /*html*/`<path d="${d}" stroke="black" stroke-width="0" fill="${color}" fill-opacity="0.2"/>`
        )
        res.push(cell_svg)
    }
    return res
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
    /*html*/`<input type="range" class="custom-range" max=${max} >`)
}

function cols(parent,nb_cols,props=null){
    let contaienr = html(parent,"div",/*html*/`<div class="container"></div>`)
    let row = html(contaienr,"div",/*html*/`<div class="row"></div>`)

    let cols = []
    for(let i=0;i<nb_cols;i++){
        cols.push(html(row,"div",/*html*/`<div class="${(props==null)?"col":props[i]}"></div>`))
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

function radio_group(parent,labels_list,nb_checked,callback){
    for(let i=0;i<labels_list.length;i++){
        const label = labels_list[i]
        let element = html(parent,"div",
        /*html*/`<div class="custom-control custom-radio">
                    <input type="radio" data-action="${label}" class="custom-control-input" id="rg_${label}" name="rg_radios" ${(i==nb_checked)?"checked":""} >
                    <label class="custom-control-label" for="rg_${label}">${label}</label>
                </div>`
        )
        $(element).change(callback)
    }
}

function checkbox_group(parent,name,labels_list,checked_list,callback){
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
    circle_move,
    draw_path,
    draw_cells,
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
    radio_group,
    defined,
    draw_cells_bezier,
    checkbox_group
}
