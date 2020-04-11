import {defined,html} from "./utils.js"

import {Vector} from "../libs/Vector.js"

let svg = null

function line(l){
    let d = `M ${l.p1.x} ${l.p1.y} L ${l.p2.x} ${l.p2.y} `
    return html(svg,"path",
    /*html*/`<path d="${d}" stroke="red" stroke-width="2" />`
    )
}

function circ(point){
    return html(svg,"circle",
    /*html*/`<circle cx=${point.x} cy=${point.y} r="3" stroke="black" stroke-width="0" fill="blue" />`
    );
}

function center(va,vb){
    return ({x:(va.x+vb.x)/2,y:(va.y+vb.y)/2})
}

function he_length(he){
    const dx = he.edge.va.x-he.edge.vb.x
    const dy = he.edge.va.y-he.edge.vb.y
    return Math.sqrt(dx * dx + dy * dy)
}

/**
 * returns the first counter clockwise point, depending if the site is the leftSite of the edge or its rightSite
 * @param {Half Edge} he 
 */
function first_ccw(he){
    return (defined(he.edge.lSite) && (he.site.id == he.edge.lSite.id))?he.edge.va:he.edge.vb
}

//returns both points in the positive rotation order relative to the seed
function ccw_vertices(he){
    if(defined(he.edge.lSite) && (he.site.id == he.edge.lSite.id)){
        return [he.edge.va,he.edge.vb]
    }else{
        return [he.edge.vb,he.edge.va]
    }
}

class cell{
    constructor(create){
        if(defined(create.site)){
            this.from_rhill_cell(create)
        }
        this.add_prev_next()
    }
    copy(){
        let copy = {}
        copy.seed = {x:this.seed.x,y:this.seed.y}
        copy.edges = []
        for(let i=0;i<this.edges.length;i++){
            const e = this.edges[i]
            let ne = {}
            ne.v1 = {x:e.v1.x,y:e.v1.y}
            ne.v2 = {x:e.v2.x,y:e.v2.y}
            ne.c = {x:e.c.x,y:e.c.y}
            ne.l = e.l
            ne.a = e.a
            copy.edges.push(ne)
        }
        return copy
    }
    add_prev_next(){
        for(let i=0;i<this.edges.length;i++){
            let edge = this.edges[i]
            edge.prev = (i==0)?this.edges.slice(-1)[0]:this.edges[i-1]
            edge.next = (i==this.edges.length-1)?this.edges[0]:this.edges[i+1]
        }
    }
    from_rhill_cell(c){
        this.seed = c.site
        this.edges = []
        for(let i=0;i<c.halfedges.length;i++){
            const he = c.halfedges[i]
            let [v1,v2] = ccw_vertices(he)
            let edge = {v1:v1,v2:v2}
            edge.l = he_length(he)
            edge.c = center(edge.v1,edge.v2)
            edge.a = c.halfedges[i].angle
            this.edges.push(edge)
        }
    }
    /**
     * M(point-1) C(control-1) (control-2) (point-2)
     * S(control-next) (point-next)
     * first    => M(point-1) C(control-1)
     * second   =>  (control-2) (point-2)
     * third... => S(control-next) (point-next)
     */
    path_bezier_cubic_filter(min_edge){
        let d = ""
        let step = "first"
        for(let i=0;i<this.edges.length;i++){
            let e = this.edges[i]
            if(e.l > min_edge){
                if(step == "first"){
                    d = d + `M${e.c.x},${e.c.y} C${e.v2.x},${e.v2.y} `
                    step = "sec"
                    //if(debug)console.log("step 1")
                }else if(step == "sec"){
                    d = d + `${e.v1.x},${e.v1.y} ${e.c.x},${e.c.y} `
                    step = "third"
                    //if(debug)console.log("step 2")
                }else{
                    d = d + `S${e.v1.x},${e.v1.y} ${e.c.x},${e.c.y} `
                    //if(debug)console.log("step 3...")
                    step = "reached"
                }
            }
        }
        //find closing edge
        let found = false
        for(let i=0;(i<this.edges.length)&&(!found);i++){
            let e = this.edges[i]
            if(e.l > min_edge){
                d = d + `S${e.v1.x},${e.v1.y} ${e.c.x},${e.c.y} `
                found = true
            }
        }
        if(step == "reached"){
            d = d + "Z"
        }else{
            //discard as minimal number of filtered edges of 3 is not reached
            d = ""
        }
        return d
    }
    //M(point-1) C(control-1) (control-2) (point-2)
    //S(control-next) (point-next)
    path_bezier_cubic(){
        let d = ""
        for(let i=0;i<this.edges.length;i++){
            let e = this.edges[i]
            if(i==0){
                d = d + `M${e.c.x},${e.c.y} C${e.v2.x},${e.v2.y} ${e.v2.x},${e.v2.y} ${e.next.c.x},${e.next.c.y} `
            }else{
                d = d + `S${e.v2.x},${e.v2.y} ${e.next.c.x},${e.next.c.y} `
            }
        }
        d = d + "Z"
        return d
    }
    //M(point-1) Q(control-1) (point-2)
    //Q(control-next) (point-next)
    path_bezier_quadratic(parent,debug){
        let d = ""
        for(let i=0;i<this.edges.length;i++){
            let e = this.edges[i]
            if(i==0){
                d = d + `M${e.c.x},${e.c.y} Q${e.v2.x},${e.v2.y} ${e.next.c.x},${e.next.c.y} `
            }else{
                d = d + `Q${e.v2.x},${e.v2.y} ${e.next.c.x},${e.next.c.y} `
            }
        }
        d = d + "Z"
        return d
    }
    path_edges(){
        let d = ""
        for(let i=0;i<this.edges.length;i++){
            let e = this.edges[i]
            if(i==0){
                d = d + `M ${e.v1.x} ${e.v1.y} L ${e.v2.x} ${e.v2.y} `
            }else{
                d = d + `L ${e.v2.x} ${e.v2.y} `
            }
        }
        d = d + "Z"
        return d
    }
    retract(dist,org,ind){
        if(ind == 2){
            let lines = []
            this.edges.forEach((e)=>{
                circ(e.c)
                const dir = Vector.sub(e.c,e.v2)
                let inside = Vector.perp(dir)
                inside = Vector.normalise(inside)
                inside = Vector.mult(inside,dist)
                const new_center = Vector.add(e.c,inside)
                const l = {p1:new_center,p2:Vector.add(e.v2,inside)}
                const new_edge = {p1:Vector.add(e.v1,inside),p2:Vector.add(e.v2,inside)}
                line(new_edge)
                lines.push(l)
                //circ(new_center)
            })
        }
    }

}

class diagram{
    constructor(create){
        this.type = "wfil"
        this.cells = []
        this.org_cells = []
        if(create.type =="rhill"){
            this.cells      =  this.from_rhill_diagram(create)
        }
        this.cells.forEach((c)=>{this.org_cells.push(c.copy())})

    }
    from_rhill_diagram(diag){
        let res = []
        for(let i=0;i<diag.cells.length;i++){
            res.push(new cell(diag.cells[i]))
        }
        return res
    }
    retract_cells(dist,parent){
        svg = parent
        //console.log(this.cells)
        dist = parseFloat(dist)
        for(let i=0;i<this.cells.length;i++){
            this.cells[i].retract(dist,this.org_cells[i],i)
        }
    }
}


export{
    diagram,
    cell
}
