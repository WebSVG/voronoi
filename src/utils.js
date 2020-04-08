function defined(obj){
    return (typeof(obj) != "undefined")
}

function html(parent,tagName,svg_text){
    parent.insertAdjacentHTML("beforeend",svg_text);
    let elements = parent.getElementsByTagName(tagName);
    let res_svg =  elements[elements.length-1];
    return res_svg;
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

function save_json(object,fileName){
    const json_str = JSON.stringify(object,null,'\t');
    var blob = new Blob([json_str], {type: 'application/json'});
    saveAs(blob, fileName);
}

export{
    html,
    br,hr,
    defined,
    Events,
    save_json,
}
