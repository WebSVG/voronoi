import {defined,html} from "./utils.js"

class Svg{
    constructor(svg_element){
        this.el = svg_element
    }
    set_parent(svg_element){
        this.el = svg_element
    }
    
    path(d,color,opacity){
        return html(this.el,"path",
        /*html*/`<path d="${d}" stroke="red" stroke-width="0" fill="${color}" fill-opacity="${opacity}"/>`
        )
    }

    text(x,y,str){
        html(this.el,"text",/*html*/`<text x="${x}" y="${y}">${str}</text>`)
    }

    circle(x,y,params={}){
        //if(!defined(params.parent)){parent=this.el}
        let if_id = (defined(params.id))?`id=${params.id}`:""
        return html(this.el,"circle",
        /*html*/`<circle ${if_id} cx=${x} cy=${y} r="3" stroke="black" stroke-width="3" fill="red" />`
        );
    }

    circ(x,y){
        //if(parent==null){parent=this.el}
        return html(this.el,"circle",
        /*html*/`<circle cx=${x} cy=${y} r="3" stroke="black" stroke-width="3" fill="red" />`
        );
    }
    
    circle_p_id(parent,x,y,id){
        return html(parent,"circle",
        /*html*/`<circle id=${id} cx=${x} cy=${y} r="3" stroke="black" stroke-width="3" fill="red" />`
        );
    }
    
    eline(e,col){
        let d = `M ${e.v1.x} ${e.v1.y} L ${e.v2.x} ${e.v2.y} `
        return html(this.el,"path",
        /*html*/`<path d="${d}" stroke="${col}" stroke-width="2" />`
        )
    }
    
    line(l,col){
        let d = `M ${l.p1.x} ${l.p1.y} L ${l.p2.x} ${l.p2.y} `
        return html(this.el,"path",
        /*html*/`<path d="${d}" stroke="${col}" stroke-width="2" />`
        )
    }
    
    pline(v1,v2,col){
        let d = `M ${v1.x} ${v1.y} L ${v2.x} ${v2.y} `
        return html(this.el,"path",
        /*html*/`<path d="${d}" stroke="${col}" stroke-width="1" />`
        )
    }

    pattern(parent,url,w,h){
        return html(parent,"rect",/*html*/`
            <defs>
                <pattern id="image" x="0" y="0" patternUnits="userSpaceOnUse" height="1" width="1" >
                    <image x="0" y="0" xlink:href=${url} ></image>
                </pattern>
            </defs>
            <rect width="${w}" height="${h}" fill="url(#image)" fill-opacity="0.1"/>
        `)
    }

    save(fileName,evg_element=null){
        if(evg_element == null){evg_element = this.el}
        let s = new XMLSerializer();
        const svg_str = s.serializeToString(evg_element);
        var blob = new Blob([svg_str], {type: 'image/svg+xml'});
        saveAs(blob, fileName);
    }
    
}

export{
    Svg
}
