
let template = document.createElement("template")

function defined(obj){
    return (typeof(obj) != "undefined")
}

function uid(){
    return Date.now()+"_"+Math.floor(Math.random() * 10000)
}

function suid(){
    let date = (Date.now()).toString();
    const sub = date.substring(date.length-6,date.length-1);
    return sub+"_"+Math.floor(Math.random() * 10000)
}

function send(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

function temp(html_text){
    const fragment = document.createRange().createContextualFragment(html_text);
    template.appendChild(fragment);//this also returns fragment, not the newly created node
    return template.childNodes[template.childNodes.length-1];
}

function html(parent,html_text){
    parent.insertAdjacentHTML("beforeend",html_text);
    return parent.childNodes[parent.childNodes.length-1];
}

function htmls(parent,html_text){
    parent.insertAdjacentHTML("beforeend",html_text);
    return parent.childNodes;
}

function html_tag(parent,tagName,html_text){
    parent.insertAdjacentHTML("beforeend",html_text);
    let elements = parent.getElementsByTagName(tagName);
    let res_svg =  elements[elements.length-1];
    return res_svg;
}

function css(sheet,text){
    sheet.insertRule(text);
}

function br(parent){
    parent.appendChild(document.createElement("br"))
}

function hr(parent){
    parent.appendChild(document.createElement("hr"))
}

function image(parent,url){
    return html(parent,/*html*/`
        <image x="0" y="0" xlink:href=${url}></image>
    `)
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

function rand_col() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export{
    html,
    br,hr,
    defined,
    Events,
    save_json,
    rand_col,
    image,
    uid,
    suid,
    send,
    temp,
    css,
    html_tag,
    htmls
}
