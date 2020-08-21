//* [wikipedia - lines intersection](https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection)

class Geometry{
    distance(va,vb){
        const dx = va.x-vb.x
        const dy = va.y-vb.y
        return Math.sqrt(dx * dx + dy * dy)
    }
    
    walls_distance(point,w,h){
        let walls_dist = []
        walls_dist.push(Math.abs(point.x))
        walls_dist.push(Math.abs(point.y))
        walls_dist.push(Math.abs(w-point.x))
        walls_dist.push(Math.abs(h-point.y))
        return Math.min(...walls_dist)
    }
    
    center(va,vb){
        return ({x:(va.x+vb.x)/2,y:(va.y+vb.y)/2})
    }
    
    //refactor name to intersection()
    intersect(e1,e2){
        const x1 = e1.v1.x
        const y1 = e1.v1.y
        const x2 = e1.v2.x
        const y2 = e1.v2.y
        const x3 = e2.v1.x
        const y3 = e2.v1.y
        const x4 = e2.v2.x
        const y4 = e2.v2.y
        const x1_y2_m_y1_x2 = (x1*y2 - y1*x2)
        const x3_y4_m_y3_x4 = (x3*y4 - y3*x4)
        const denominator = ((x1-x2)*(y3-y4) - (y1-y2)*(x3-x4))
        return {x:(x1_y2_m_y1_x2*(x3-x4) - (x1-x2)*x3_y4_m_y3_x4) / denominator,
                y:(x1_y2_m_y1_x2*(y3-y4) - (y1-y2)*x3_y4_m_y3_x4) / denominator}
    }
    compute_path_points(path,step_size){
        let res = []
        const path_lenght = path.getTotalLength()
        const nb_steps = Math.round(path_lenght / step_size)
        for(let i=0;i<nb_steps;i++){
            let dist = step_size * i
            res.push(path.getPointAtLength(dist))
        }
        console.log(`path length: ${path_lenght.toFixed(1)} , step:${step_size} , nb:${nb_steps}`)
        return res
    }
    inside_id(x,y,id){
        let res = document.elementFromPoint(x,y)
        if(res == null){
            return false
        }else{
            return (res.id == id)
        }
    }
}

export{Geometry}
