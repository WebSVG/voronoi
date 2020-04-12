import {defined,html} from "./utils.js"

/**
 * returns the first counter clockwise point, depending if the site is the leftSite of the edge or its rightSite
 * @param {Half Edge} he 
 */
function first_ccw(he){
    return (defined(he.edge.lSite) && (he.site.id == he.edge.lSite.id))?he.edge.va:he.edge.vb
}


function center_he(he){
    return ({x:(he.edge.va.x+he.edge.vb.x)/2,y:(he.edge.va.y+he.edge.vb.y)/2})
}

function center(va,vb){
    return ({x:(va.x+vb.x)/2,y:(va.y+vb.y)/2})
}

function he_length(he){
    const dx = he.edge.va.x-he.edge.vb.x
    const dy = he.edge.va.y-he.edge.vb.y
    return Math.sqrt(dx * dx + dy * dy)
}

function points_dist(va,vb){
    const dx = va.x-vb.x
    const dy = va.y-vb.y
    return Math.sqrt(dx * dx + dy * dy)
}

function circ(parent,x,y,id){
    return html(parent,"circle",
    /*html*/`<circle id=${id} cx=${x} cy=${y} r="3" stroke="black" stroke-width="0" fill="blue" />`
    );
}

function line(parent,a,b){
    let d = `M ${a.x} ${a.y} L ${b.x} ${b.y} `
    return html(parent,"path",
    /*html*/`<path d="${d}" stroke="red" stroke-width="2" />`
    )
}

function get_cell_vertices(cell){
    let res = []
    for(let i=0;i<cell.halfedges.length;i++){
        res.push(first_ccw(cell.halfedges[i]))
    }
    return res
}

function get_cell_centers(vertices){
    let res = []
    let prev = vertices[0]
    for(let i=1;i<vertices.length;i++){
        res.push(center(prev,vertices[i]))
        prev = vertices[i]
    }
    //loop back
    res.push(center(prev,vertices[0]))
    return res
}

function get_edges_lengthes(cell){
    let res = []
    for(let i=0;i<cell.halfedges.length;i++){
        res.push(he_length(cell.halfedges[i]))
    }
    return res
}

function filter_cell(cell){
    let res = {}
    res.vertices = get_cell_vertices(cell)
    res.centers = get_cell_centers(res.vertices)
    res.edges_length = get_edges_lengthes(cell)
    return res
}

//M(point-1) C(control-1) (control-2) (point-2)
//S(control-next) (point-next)
function draw_cell_bezier_cubic(c,min_edge,parent,debug=false){
    let vertices = c.vertices
    let centers = c.centers
    let d = ""
    let pos = "first"
    let log = ""
    for(let i=0;i<vertices.length;i++){
        const p1 = (i==0)?centers.slice(-1)[0]:centers[i-1]
        const p2 = centers[i]
        const q1 = vertices[i]
        const q2 = vertices[i]
        const p1t = (i==0)?"last":i-1;
        //circ(parent,vertices[i].x,vertices[i].y)
        //html(parent,"text",/*html*/`<text x="${p1.x}" y="${p1.y}">${p1t}</text>`)
        //html(parent,"text",/*html*/`<text x="${q1.x}" y="${q1.y}">q:${i}</text>`)
        if(pos == "first"){
            d = d + `M${p1.x},${p1.y} C${q1.x},${q1.y} ${q2.x},${q2.y} ${p2.x},${p2.y} `
            log += `M(center-${p1t}) C(vert-${i}) (vert-${i}) (center-${i})`
            pos = "sec"
        }else{
            d = d + `S${q2.x},${q2.y} ${p2.x},${p2.y} `
            log += `S(vert-${i}) (center-${i}) `
        }
    }
    d = d + "Z"
    if(debug){
        console.log(log)
    }
    return d
}

//ref
//M(center-last) C(vert-0) (vert-0) (center-0)
//S(vert-1) (center-1) 
//S(vert-2) (center-2) 
//S(vert-3) (center-3) 
//
//res
//M(center-last) C(vert-0) (vert-1) (center-1)
//S(vert-2) (center-2) 
//S(vert-3) (center-3) 

//M(point-1) C(control-1) (control-2) (point-2)
//S(control-next) (point-next)
function draw_cell_bezier_cubic_test(c,min_edge,parent,debug=false){
    let vertices = c.vertices
    let centers = c.centers
    let d = ""
    let pos = "first"
    let log = ""
    for(let i=0;i<vertices.length;i++){
        const p1 = (i==0)?centers.slice(-1)[0]:centers[i-1]
        const p2 = centers[i]
        const q1 = vertices[i]
        const q2 = vertices[i]
        const p1t = (i==0)?"last":i-1;
        if(debug && (i == 0)){
            circ(parent,vertices[i].x,vertices[i].y)
            html(parent,"text",/*html*/`<text x="${p1.x}" y="${p1.y}">${p1t}</text>`)
            html(parent,"text",/*html*/`<text x="${q1.x}" y="${q1.y}">q:${i}</text>`)
        }
        if(pos == "first"){
            d = d + `M${p1.x},${p1.y} C${q1.x},${q1.y} `
            log += `M(center-${p1t}) C(vert-${i}) `
            pos = "sec"
        }else if(pos == "sec"){
            d = d + `${q2.x},${q2.y} ${p2.x},${p2.y} `
            log += `(vert-${i}) (center-${i}) `
            pos = "third"
        }else{
            d = d + `S${q2.x},${q2.y} ${p2.x},${p2.y} `
            log += `S(vert-${i}) (center-${i}) `
        }
    }
    d = d + "Z"
    if(debug){
        console.log(log)
    }
    return d
}

//M(point-1) L(point-2)
//L(point-next)
function draw_cell_edges(c,retract,parent,debug=false){
    let vertices = c.vertices
    let centers = c.centers
    let d = ""
    for(let i=0;i<vertices.length;i++){
        const p2 = vertices[i]
        if(i == 0){
            const p1 = vertices.slice(-1)[0]
            d = d + `M${p1.x},${p1.y} L${p2.x},${p2.y} `
        }else{
            d = d + `L${p2.x},${p2.y} `
        }
    }
    d = d + "Z"
    return d
}

//M(point-1) Q(control-1) (point-2)
//Q(control-next) (point-next)
function draw_cell_bezier_quadratic(c,min_edge,parent,debug){
    debug = false
    let vertices = c.vertices
    let centers = c.centers
    let d = ""
    let first = true
    for(let i=0;i<vertices.length;i++){
        const p1 = (i==0)?centers.slice(-1)[0]:centers[i-1]
        const p2 = centers[i]
        const q1 = vertices[i]
        const q2 = vertices[i]
        if(debug==true){
            const qn = (i==vertices.length-1)?vertices[0]:vertices[i+1]
            line(parent,q1,qn)
            circ(parent,q1.x,q1.y)
            const q1t = (i==0)?"last":i-1;
            html(parent,"text",/*html*/`<text x="${q1.x}" y="${q1.y}">${q1t}</text>`)
            //html(parent,"text",/*html*/`<text x="${q1.x}" y="${q1.y}">q:${i}</text>`)
        }
        if(first == true){
            d = d + `M${p1.x},${p1.y} Q${q1.x},${q1.y} ${p2.x},${p2.y} `
            first = false
        }else{
            d = d + `Q${q2.x},${q2.y} ${p2.x},${p2.y} `
        }
    }
    d = d + "Z"
    //console.log(d)
    return d
}

//M(point-1) Q(control-1) (point-2)
//Q(control-next) (point-next)
function draw_cell_bezier_quadratic_test(c,min_edge,parent,debug){
    let vertices = c.vertices
    let centers = c.centers
    let d = ""
    let pos = "first"
    for(let i=0;i<vertices.length;i++){
        const p1 = centers[i]
        const p2 = (i==centers.length-1)?centers[0]:centers[i+1]
        const qn = (i==vertices.length-1)?vertices[0]:vertices[i+1]
        const q1 = qn
        const q2 = qn
        if(debug==true){
            const q_prev = vertices[i]
            line(parent,q_prev,q1)
            circ(parent,q1.x,q1.y)
            const q1t = (i==0)?"last":i-1;
            html(parent,"text",/*html*/`<text x="${q1.x}" y="${q1.y}">${q1t}</text>`)
            //html(parent,"text",/*html*/`<text x="${q1.x}" y="${q1.y}">q:${i}</text>`)
        }
        if(pos == "first"){
            d = d + `M${p1.x},${p1.y} Q${q1.x},${q1.y} ${p2.x},${p2.y} `
            pos = "sec"
        }else{
            d = d + `Q${q2.x},${q2.y} ${p2.x},${p2.y} `
        }
    }
    d = d + "Z"
    //console.log(d)
    return d
}


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
        let group = html(parent,"g",/*html*/`<g id="svg_g_edges"/>`)
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
    
    draw_cells_direct_deprecated(parent,cells,col=false){
        let res = []
        if(cells.length>1){//otherwise single cell has no half edges
            for(let i=0;i<cells.length;i++){
                const c = cells[i]
                const p = first_ccw(c.halfedges[0])
                let d = `M ${p.x} ${p.y} `
                for(let j=1;j<c.halfedges.length;j++){
                    const p = first_ccw(c.halfedges[j])
                    d = d + `L ${p.x} ${p.y} `
                }
                d = d + "z"
                const color = (col)?this.rand_col():"#221155"
                let cell_svg = html(parent,"path",
                /*html*/`<path d="${d}" stroke="black" stroke-width="0" fill="${color}" fill-opacity="0.2"/>`
                )
                res.push(cell_svg)
            }
        }
        return res
    }
    
    draw_cells_deprecated(parent,cells,params){
        let res = []
        if(cells.length>1){//otherwise single cell has no half edges
            let group = html(parent,"g",/*html*/`<g id="svg_g_bezier_cells"/>`)
            for(let i=0;i<cells.length;i++){
                //here you can retract or detract small edges before either drawing technique
                const new_cell = filter_cell(cells[i])
                let d
                if(params.shape == "cubic"){
                    d = draw_cell_bezier_cubic_filter(new_cell,params.min_edge,parent,(i==2))
                }else if(params.shape == "quadratic"){
                    d = draw_cell_bezier_quadratic(new_cell,params.min_edge,parent,(i==2))
                }else{
                    d = draw_cell_edges(new_cell,params.min_edge,parent,(i==2))
                }
                const color = (params.color==true)?this.rand_col():"#221155"
                let cell_svg = html(group,"path",
                /*html*/`<path d="${d}" stroke="red" stroke-width="0" fill="${color}" fill-opacity="0.2"/>`
                )
                res.push(cell_svg)
            }
        }
        return res
    }

    draw_cells(parent,diag,params){
        let res = []
        if(diag.cells.length>1){//otherwise single cell has no half edges
            diag.retract_cells(params,parent)
            let group = html(parent,"g",/*html*/`<g id="svg_g_bezier_cells"/>`)
            for(let i=0;i<diag.cells.length;i++){
                //here you can retract or detract small edges before either drawing technique
                let d
                if(params.shape == "cubic"){
                    d = diag.cells[i].path_bezier_cubic_filter(params.min_edge)
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

    draw_seeds(parent,seeds){
        let svg_seeds = []
        if(seeds.length > 0){
            let group = html(parent,"g",/*html*/`<g id="svg_g_seeds"/>`)
            for(let i=0;i<seeds.length;i++){
                const s = seeds[i]
                let c = this.circle(group,s.x,s.y,`c_${s.id}`)
                svg_seeds.push(c)
            }
        }
        return svg_seeds
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
