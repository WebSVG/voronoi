import {defined,html} from "./utils.js"
import {Vector} from "../libs/Vector.js"
import {Geometry} from "./geometry.js"
import {Svg} from "./svg_utils.js"

let geom = new Geometry()

let svg = new Svg()

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
            this.add_prev_next(this.edges)
        }else{
            this.seed = {x:0,y:0}
            this.edges = []
        }
    }
    get_edges_copy(){
        let new_edges = []
        for(let i=0;i<this.edges.length;i++){
            const e = this.edges[i]
            let ne = {}
            ne.v1 = {x:e.v1.x,y:e.v1.y}
            ne.v2 = {x:e.v2.x,y:e.v2.y}
            ne.c = {x:e.c.x,y:e.c.y}
            ne.l = e.l
            ne.a = e.a
            new_edges.push(ne)
        }
        this.add_prev_next(new_edges)
        return new_edges
    }
    copy(){
        let copy = new cell("empty")
        copy.seed = {x:this.seed.x,y:this.seed.y}
        copy.edges = this.get_edges_copy()
        return copy
    }
    add_prev_next(edges){
        for(let i=0;i<edges.length;i++){
            let edge = edges[i]
            edge.prev = (i==0)?edges.slice(-1)[0]:edges[i-1]
            edge.next = (i==edges.length-1)?edges[0]:edges[i+1]
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
            edge.c = geom.center(edge.v1,edge.v2)
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
    /**
     * M(point-1) C(control-1) (control-2) (point-2)
     * S(control-next) (point-next)
     * first    => M(point-1) C(control-1)
     * second   =>  (control-2) (point-2)
     * third... => C(control-next) (control-next) (point-next)
     */
    path_bezier_cubic_filter_no_s(min_edge){
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
                    d = d + `C${e.v1.x},${e.v1.y} ${e.v1.x},${e.v1.y} ${e.c.x},${e.c.y} `
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

    remove_edge(i){
        this.edges.splice(i,1)
        this.add_prev_next(this.edges)
    }
    is_edge_to_be_removed(e){

    }
    check_closed_edges(is_debug){
        let any_edge_removed = false
        let new_edges = []
        for(let i=0;i<(this.edges.length);i++){
            if(is_debug)console.log(`processing edge (${i}) / (${this.edges.length})`)
            let this_edge_removed = false
            const e = this.edges[i]
            const l_int = geom.intersect(e,e.prev)
            const r_int = geom.intersect(e,e.next)

            const d1l = geom.distance(e.v1,l_int)
            const d1r = geom.distance(e.v1,r_int)
            if(d1l >= d1r){
                this_edge_removed = true
            }
            const d2r = geom.distance(e.v2,r_int)
            const d2l = geom.distance(e.v2,l_int)
            if(d2r >= d2l){
                this_edge_removed = true
            }

            const new_v1 = l_int
            const new_v2 = r_int
            if(this_edge_removed == true){
                if(is_debug)console.log(`   edge (${i}) removed / (${this.edges.length})`)
                //next loop will update neighbors
                //has to remove the edge immidetaly so that the lopp continues with correct edges
                this.remove_edge(i)
                i--
                if(is_debug)eline(e,"red")
                if(is_debug)console.log(`   reset to (${i})`)
                any_edge_removed = true
            }else{
                //updates for edges only to be performed after the loop as original values still being used
                let new_edge = {}
                new_edge.v1 = new_v1
                new_edge.c = geom.center(new_v1,new_v2)
                new_edge.v2 = new_v2
                new_edge.l = geom.distance(new_v1,new_v2)
                new_edge.index = i
                new_edges.push(new_edge)
            }
        }
        //after the loop - replace with the new edges
        new_edges.forEach((ne)=>{
            let e_replace = this.edges[ne.index]
            e_replace.v1 = ne.v1
            e_replace.c = ne.c
            e_replace.v2 = ne.v2
            e_replace.l = ne.l
        })
        if(is_debug)console.log(`done / (${this.edges.length})`)
        return any_edge_removed
    }

    retract(dist,org,is_debug){
        this.edges = org.get_edges_copy()
        for(let i=0;i<org.edges.length;i++){
            const e = org.edges[i]
            let n = this.edges[i]
            const dir = Vector.sub(e.c,e.v2)
            let inside = Vector.perp(dir)
            inside = Vector.normalise(inside)
            inside = Vector.mult(inside,dist)
            n.c = Vector.add(e.c,inside)
            n.v1=Vector.add(e.v1,inside)
            n.v2=Vector.add(e.v2,inside)
            if(is_debug){
                eline(n,"blue")
                //circ(n.v1,"red")
            }
        }
        let removed = true;
        while((this.edges.length>3)&&(removed==true)){
            removed = this.check_closed_edges(is_debug)
        }
        //one last pass after removal of last edge to correct neighbors
        //not efficient but has to calculate geom.intersections anyway
        this.check_closed_edges(is_debug)
        if(is_debug){
            for(let i=0;i<this.edges.length;i++){
                let p = this.edges[i].v1
                svg.text(p.x,p.y,i)
            }
        }
    }
}

class voronoi_diag{
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
    retract_cells(params,parent){
        svg.set_parent(parent)
        const dist = parseFloat(params.retraction)
        for(let i=0;i<this.cells.length;i++){
            const is_debug = (params.debug == 0)?false:(params.debug-1 == i)
            this.cells[i].retract(dist,this.org_cells[i],is_debug)
        }
    }
}


export{
    voronoi_diag,
    cell
}
