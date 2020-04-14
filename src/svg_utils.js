import {defined,html} from "./utils.js"

function circle_p_id(parent,x,y,id){
    return html(parent,"circle",
    /*html*/`<circle id=${id} cx=${x} cy=${y} r="3" stroke="black" stroke-width="3" fill="red" />`
    );
}

class Svg{
    constructor(svg_element){
        this.el = svg_element
    }
    set_parent(svg_element){
        this.el = svg_element
    }
    
    text(x,y,str){
        html(svg,"text",/*html*/`<text x="${x}" y="${y}">${str}</text>`)
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
        
    draw_path(edges,width){
        let group = html(this.el,"g",/*html*/`<g id="svg_g_edges"/>`)
        let d = ""
        edges.forEach((e)=>{
            d = d + `M ${e.va.x} ${e.va.y} L ${e.vb.x} ${e.vb.y} `
        })
        return html(group,"path",
        /*html*/`<path id="svg_path_edges" d="${d}" stroke="black" stroke-width="${width}" />`
        )
    
    }
    
    rand_col() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    draw_cells(diag,params){
        let res = []
        if(diag.cells.length>1){//otherwise single cell has no half edges
            diag.retract_cells(params,this.el)
            let group = html(this.el,"g",/*html*/`<g id="svg_g_bezier_cells"/>`)
            for(let i=0;i<diag.cells.length;i++){
                //here you can retract or detract small edges before either drawing technique
                let d
                if(params.shape == "cubic"){
                    d = diag.cells[i].path_bezier_cubic_filter_no_s(params.min_edge)
                }else if(params.shape == "quadratic"){
                    d = diag.cells[i].path_bezier_quadratic()
                }else{
                    d = diag.cells[i].path_edges()
                }
                let color = (params.color==true)?this.rand_col():"#221155"
                let cell_svg = html(group,"path",
                /*html*/`<path d="${d}" stroke="red" stroke-width="0" fill="${color}" fill-opacity="0.2"/>`
                )
                res.push(cell_svg)
            }
        }
        return res
    }

    draw_seeds(seeds){
        let svg_seeds = []
        if(seeds.length > 0){
            let group = html(this.el,"g",/*html*/`<g id="svg_g_seeds"/>`)
            for(let i=0;i<seeds.length;i++){
                const s = seeds[i]
                let c = circle_p_id(group,s.x,s.y,`c_${s.id}`)
                svg_seeds.push(c)
            }
        }
        return svg_seeds
    }
    
    save(fileName){
        let s = new XMLSerializer();
        const svg_str = s.serializeToString(this.el);
        var blob = new Blob([svg_str], {type: 'image/svg+xml'});
        saveAs(blob, fileName);
    }
    
}

export{
    Svg
}
