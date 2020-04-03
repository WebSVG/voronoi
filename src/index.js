
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

function button(parent,id,Text){
    return html(parent,"button",
    /*html*/`<button id=${id} type="button" class="btn btn-primary" style="margin:10px">${Text}</button>`
    )
}

function button_input(parent,id,Text,input){
    return html(parent,"div",
    /*html*/`   <div class="input-group mb-3">
                <div class="input-group-prepend">
                <button class="btn btn-outline-secondary" type="button" id="button-addon1">${Text}</button>
                </div>
                <input type="text" class="form-control" placeholder="seeds number" aria-label="Example text with button addon" aria-describedby="button-addon1">
                </div>`
    )
}

function br(parent){
    parent.appendChild(document.createElement("br"))
}

function get_seeds(nb,w,h){
    let res = []
    for(let i = 0;i<nb; i++){
        res.push({
            id:i,
            x:Math.round(Math.random()*w),
            y:Math.round(Math.random()*h)
        })
    }
    return res
}

function range(parent,max){
    return html(parent,"input",
    /*html*/`<input type="range" class="custom-range" id="customRange1" max=${max}>`)
}

export {
    html,
    attributes,
    circle,
    button,
    br,
    get_seeds,
    button_input,
    range
    };
