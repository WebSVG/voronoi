import {Vector} from "../libs/Vector.js"

function angle_v2v(va,vb){
    const aa = Vector.angle({x:1,y:0},va)
    const ab = Vector.angle({x:1,y:0},vb)
    return ab - aa
}

function angle_v(va){
    return Vector.angle({x:1,y:0},va)
}

function get_final_points_list(all_points){
    if(all_points.length % 3 != 0){
        console.error(`lenght error '${all_points.length}' c structure unexpected not x3 pairs of x,y`)
    }
    const nb_points = all_points.length / 3
    let result = []
    for(let i=0;i<nb_points;i++){
        let x  = all_points[i*3 + 2].x
        let y  = all_points[i*3 + 2].y
        result.push({x,y})
    }
    return result
}

function get_all_points_list(c){
    let text_p_list = c.split(/[\s,]+/)
    let result = []
    const nb_points = text_p_list.length /2
    for(let i=0;i<nb_points;i++){
        let x  = parseFloat(text_p_list[i*2])
        let y  = parseFloat(text_p_list[i*2 + 1])
        if(!isNaN(x) && !isNaN(y)){
            result.push({x,y})
        }
    }
    return result
}

function calc_vector(p_list){
    return p_list.reduce(
        (prev,current) => ({x:prev.x+current.x,y:prev.y+current.y}),
        {x:0,y:0}
    )
}

class EdgeStyle{
    constructor(){
        this.c = "0,0 -1.4871,-4.88795 -10.8924,-7.71105 -9.4052,-2.8231 -31.4868,-6.3378 -45.1916,-5.8582 -13.7048,0.4797 -24.5712,5.616 -35.9859,7.253 -11.4147,1.637 -24.7448,2.94562 -32.3594,2.7896 -7.6146,-0.15602 -11.4823,-1.3272 -13.1111,-1.6737 -1.6288,-0.3465 -3.8802,0.16445 -3.1621,-4.74403 0.7181,-4.90848 17.3623,-2.16152 18.6436,-15.4364 1.2813,-13.2749 -13.2979,-21.1288 -22.4622,-22.7144 -9.1644,-1.5856 -17.6683,5.1485 -21.5,10.3416 -3.8317,5.1931 -3.1156,10.2898 -2.205,14.6997 0.9106,4.40985 4.3095,7.6025 6.4161,10.32153 2.1066,2.71903 7.2212,1.98634 5.8582,6.1372 -1.363,4.15086 -15.1724,0.0416 -24.0569,2.05626 -8.8844,2.01466 -14.7578,11.26765 -28.5517,10.77025 -20.967,-0.95586 -43.1194,-6.23136 -43.1194,-6.23136"
        this.p_all_list = get_all_points_list(this.c)
        this.p_final_list = get_final_points_list(this.p_all_list)
        this.vector = calc_vector(this.p_final_list)
        console.log(this.vector)
        this.magnitude = Vector.magnitude(this.vector)
        console.log(this.magnitude)
        //const angle = 
        //TODO, check on closed loop would end up in magnitude of zero => div /0
    }
    straight_line(e){
        return `M ${e.va.x} ${e.va.y} L ${e.vb.x} ${e.vb.y} `
    }
    curved_line(e){
        const TargetVector = Vector.sub(e.vb,e.va)
        console.log(" ---------------------- ")
        console.log(`input = (${e.va.x},${e.va.y})->(${e.vb.x},${e.vb.y})`)
        console.log(`target = (${TargetVector.x},${TargetVector.y}) angle = '${angle_v(TargetVector)}'`)
        const angle = angle_v2v(this.vector,TargetVector)
        const scale = Vector.magnitude(TargetVector) / this.magnitude
        console.log(`a=${angle} , s=${scale}`)
        //set first MoveTo and start Bezeir curve
        let start = `M ${e.va.x} ${e.va.y} c `
        let middle = ""
        let count = 0
        this.p_all_list.forEach((p)=>{
            let adjusted_point = Vector.rotate(p,angle)
            adjusted_point = Vector.mult(adjusted_point,scale)
            middle = middle + `${adjusted_point.x},${adjusted_point.y} `
            count = count + 1
        })
        const v_draw = calc_vector(get_final_points_list(get_all_points_list(middle)))
        console.log(`v_draw = (${v_draw.x},${v_draw.y}) angle = '${angle_v(v_draw)}'`)
        let end = `L ${e.vb.x} ${e.vb.y} `
        return start + middle + end
    }
}

export {EdgeStyle}

