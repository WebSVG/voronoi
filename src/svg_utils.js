import {defined,html} from "./utils.js"

class Svg{
    circle(parent,x,y,id){
        return html(parent,"circle",
        /*html*/`<circle id=${id} cx=${x} cy=${y} r="3" stroke="black" stroke-width="3" fill="red" />`
        );
    }
    
    circle_move(element,coord){
        element.setAttributeNS(null,"cx",coord.x)
        element.setAttributeNS(null,"cy",coord.y)
    }
    
    draw_path(parent,edges,width){
        let d = ""
        edges.forEach((e)=>{
            d = d + `M ${e.va.x} ${e.va.y} L ${e.vb.x} ${e.vb.y} `
        })
        return html(parent,"path",
        /*html*/`<path d="${d}" stroke="black" stroke-width="${width}" />`
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
    /**
     * returns the first counter clockwise point, depending if the site is the leftSite of the edge or its rightSite
     * @param {Half Edge} he 
     */
    first_ccw(he){
        return (defined(he.edge.lSite) && (he.site.id == he.edge.lSite.id))?he.edge.va:he.edge.vb
    }
    
    center(he){
        return ({x:(he.edge.va.x+he.edge.vb.x)/2,y:(he.edge.va.y+he.edge.vb.y)/2})
    }
    
    edge_length(he){
        const dx = he.edge.va.x-he.edge.vb.x
        const dy = he.edge.va.y-he.edge.vb.y
        return Math.sqrt(dx * dx + dy * dy)
    }
    
    draw_cells(parent,cells,col=false){
        let res = []
        for(let i=0;i<cells.length;i++){
            const c = cells[i]
            const p = this.first_ccw(c.halfedges[0])
            let d = `M ${p.x} ${p.y} `
            for(let j=1;j<c.halfedges.length;j++){
                const p = this.first_ccw(c.halfedges[j])
                d = d + `L ${p.x} ${p.y} `
            }
            d = d + "z"
            const color = (col)?this.rand_col():"#221155"
            let cell_svg = html(parent,"path",
            /*html*/`<path d="${d}" stroke="black" stroke-width="0" fill="${color}" fill-opacity="0.2"/>`
            )
            res.push(cell_svg)
        }
        return res
    }
    
    draw_cells_bezier(parent,cells,min_edge=0,col=false){
        if(cells.length<=1){
            return
        }
        let res = []
        for(let i=0;i<cells.length;i++){
            const c = cells[i]
            const Q0 = this.first_ccw(c.halfedges[0])
            const center0 = this.center(c.halfedges[0])
            let d = `M ${center0.x} ${center0.y} `
            for(let j=1;j<c.halfedges.length;j++){
                const e_length = this.edge_length(c.halfedges[j])
                if(e_length > min_edge){
                    const Q = this.first_ccw(c.halfedges[j])
                    const cent = this.center(c.halfedges[j])
                    d = d + `Q ${Q.x} ${Q.y} ${cent.x} ${cent.y} `
                }
            }
            //d = d + "z"
            const e0_length = this.edge_length(c.halfedges[0])
            if(e0_length > min_edge){
                d = d + `Q ${Q0.x} ${Q0.y} ${center0.x} ${center0.y} `
            }
            const color = (col)?this.rand_col():"#221155"
            let cell_svg = html(parent,"path",
            /*html*/`<path d="${d}" stroke="black" stroke-width="0" fill="${color}" fill-opacity="0.2"/>`
            )
            res.push(cell_svg)
        }
        return res
    }
    
    save(svg,fileName){
        let s = new XMLSerializer();
        const svg_str = s.serializeToString(svg);
        var blob = new Blob([svg_str], {type: 'image/svg+xml'});
        saveAs(blob, fileName);
    }
    
}


export{
    Svg
}
