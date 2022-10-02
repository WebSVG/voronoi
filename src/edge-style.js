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
        this.curves_list = [
            "0,0 -1.4871,-4.88795 -10.8924,-7.71105 -9.4052,-2.8231 -31.4868,-6.3378 -45.1916,-5.8582 -13.7048,0.4797 -24.5712,5.616 -35.9859,7.253 -11.4147,1.637 -24.7448,2.94562 -32.3594,2.7896 -7.6146,-0.15602 -11.4823,-1.3272 -13.1111,-1.6737 -1.6288,-0.3465 -3.8802,0.16445 -3.1621,-4.74403 0.7181,-4.90848 17.3623,-2.16152 18.6436,-15.4364 1.2813,-13.2749 -13.2979,-21.1288 -22.4622,-22.7144 -9.1644,-1.5856 -17.6683,5.1485 -21.5,10.3416 -3.8317,5.1931 -3.1156,10.2898 -2.205,14.6997 0.9106,4.40985 4.3095,7.6025 6.4161,10.32153 2.1066,2.71903 7.2212,1.98634 5.8582,6.1372 -1.363,4.15086 -15.1724,0.0416 -24.0569,2.05626 -8.8844,2.01466 -14.7578,11.26765 -28.5517,10.77025 -20.967,-0.95586 -43.1194,-6.23136 -43.1194,-6.23136",
            "0,0 -15.0576,-4.91563 -24.4061,-5.69716 -9.3485,-0.78111 -15.3291,0.008 -25.9741,0.31725 -10.645,0.30947 -28.3521,2.79261 -37.881,1.74034 -9.5288,-1.05228 -14.4534,-2.90901 -18.9113,-5.14991 -4.4579,-2.24092 -7.6189,-3.0326 -8.1294,-6.38391 -0.5101,-3.35149 3.9783,-5.27145 5.6712,-8.24099 1.6927,-2.9695 4.2728,-5.7118 4.4127,-9.5332 0.1398,-3.8215 -0.2885,-8.7032 -4.3858,-11.6403 -4.0974,-2.937 -13.1898,-1.5271 -17.7985,-0.5942 -4.6089,0.9329 -6.1359,2.6967 -9.4462,4.3641 -3.3101,1.6674 -6.1074,5.9814 -10.3819,5.6781 -4.2744,-0.3033 -7.1528,-7.3289 -11.1139,-8.3114 -3.9613,-0.9828 -7.1058,-0.664 -10.4812,1.646 -3.3758,2.3105 -6.8638,8.2621 -6.9975,12.05 -0.1337,3.7877 1.7066,5.3546 3.8743,7.9088 2.1676,2.55418 7.0319,4.12454 9.1987,6.55118 2.1667,2.42663 4.6321,5.01703 3.9857,7.1961 -0.6463,2.17908 -0.2716,1.78113 -4.7788,2.53845 -4.5062,0.75745 -14.3558,-2.36609 -21.7408,-3.4019 -7.3849,-1.03586 -16.4292,-2.65884 -22.5651,-2.80063 -6.136,-0.14161 -6.5926,-0.5058 -14.0454,1.08844 -7.4528,1.59421 -29.7854,10.67484 -29.7854,10.67484"
        ]
        this.p_all_lists = []
        this.p_final_lists = []
        this.vectors = []
        this.magnitudes = []
        this.curves_list.forEach((c,i)=>{
            this.p_all_lists.push(get_all_points_list(c))
            this.p_final_lists.push(get_final_points_list(this.p_all_lists[i]))
            this.vectors.push(calc_vector(this.p_final_lists[i]))
            //console.log(this.vector)
            this.magnitudes.push(Vector.magnitude(this.vectors[i]))
            //console.log(this.magnitude)
            //const angle = 
            //TODO, check on closed loop would end up in magnitude of zero => div /0
        })
    }
    get_nb_styles(){
        return this.curves_list.length
    }
    straight_line(e){
        return `M ${e.va.x} ${e.va.y} L ${e.vb.x} ${e.vb.y} `
    }
    curved_line(e,id=0){
        if(id>this.curves_list.length-1+1){//id 0 is reserved for straight line - styles start from 1
            id=0
        }
        if(id == 0){
            return this.straight_line(e)
        }
        //id 0 is reserved for straight line - styles start from 1
        const style_id = id-1
        const TargetVector = Vector.sub(e.vb,e.va)
        //console.log(" ---------------------- ")
        //console.log(`input = (${e.va.x},${e.va.y})->(${e.vb.x},${e.vb.y})`)
        //console.log(`target = (${TargetVector.x},${TargetVector.y}) angle = '${angle_v(TargetVector)}'`)
        const angle = angle_v2v(this.vectors[style_id],TargetVector)
        const scale = Vector.magnitude(TargetVector) / this.magnitudes[style_id]
        //console.log(`a=${angle} , s=${scale}`)
        //set first MoveTo and start Bezeir curve
        let start = `M ${e.va.x} ${e.va.y} c `
        let middle = ""
        let count = 0
        this.p_all_lists[style_id].forEach((p)=>{
            let adjusted_point = Vector.rotate(p,angle)
            adjusted_point = Vector.mult(adjusted_point,scale)
            middle = middle + `${adjusted_point.x},${adjusted_point.y} `
            count = count + 1
        })
        //const v_draw = calc_vector(get_final_points_list(get_all_points_list(middle)))
        //console.log(`v_draw = (${v_draw.x},${v_draw.y}) angle = '${angle_v(v_draw)}'`)
        let end = `L ${e.vb.x} ${e.vb.y} `
        return start + middle + end
    }
}

export {EdgeStyle}

