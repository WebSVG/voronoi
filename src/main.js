import {hr,html, br,} from "./web-js-utils.js"
import {Bootstrap} from "./bs_utils.js"
import {voronoi_app} from "./voronoi_app.js"
import {Grid} from "./scale-grid.js"

const b = document.body
let vor = new voronoi_app()
let bs = new Bootstrap()
let grid = new Grid(b,120)
let col_svg = null


function menu_export(ecol0,ecol1,ecol2,ecol3,ecol4){
    //br(parent)
    //let [ecol0,ecol1,ecol2,ecol3,ecol4] = bs.cols(parent,5,["col-3","col-1","col-2","col-2","col"])
    let btn_save_svg = bs.button(ecol0,"btn_save",`export SVG`);

    //let in_export_ratio = bs.input_text(ecol0,"in_export_ratio",`${vor.export_ratio}`,"w-50");
    //in_export_ratio.style.visibility = "hidden"
    //if(vor.export_ratio == 1.0){
    //    in_export_ratio.value = null
    //    in_export_ratio.setAttribute("placeholder",`1 unit = 1 pixel`)
    //}
    let btn_save_data = bs.button(ecol0,"btn_save",`export seeds coordinates`);

    html(ecol1,/*html*/`<p align="center">Export</p>`)
    const lst = vor.export_svg
    const export_states = [lst.cells,lst.edges,lst.seeds]
    bs.checkbox_group(ecol1,"cbx_export",["cells","edges","seeds"],export_states,(e)=>{
                            vor.export_svg[e.target.getAttribute("data-name")] = e.target.checked
                        })



    html(ecol2,/*html*/`<p align="center">Shape cells view</p>`)
    let rg_list = vor.shape.cells_action_list
    let sact_index = rg_list.findIndex((shape)=>{return (shape == vor.shape.config.cells_action)})
    let rg_cells = bs.radio_group(ecol2,"rgg_shape_cells",rg_list,sact_index)
    rg_cells.forEach((el)=>{$(el).change((e)=>{vor.update({shape_cells:e.target.getAttribute("data-label")})})})

    html(ecol3,/*html*/`<p align="center">Shape seeds sample</p>`)
    rg_list = vor.shape.seeds_action_list
    sact_index = rg_list.findIndex((shape)=>{return (shape == vor.shape.config.seeds_action)})
    let rg_seeds = bs.radio_group(ecol3,"rgg_shpae_seeds",rg_list,sact_index)
    rg_seeds.forEach((el)=>{$(el).change((e)=>{vor.update({shape_seeds:e.target.getAttribute("data-label")})})})



    html(ecol4,/*html*/`<a>
        <p align="center">
            <a href="https://github.com/WebSVG/voronoi" target="_blank">
            <img src=./media/github.png width=40 href="https://github.com/WebSVG/voronoi">
            <p align="center">User Guide and Source Code</p>
        </p>
    </a>`)
    html(ecol4,/*html*/`<p align="center">v25.04.2020</p>`)

    $(btn_save_svg).click(()=>{
        vor.save_svg("voronoi_svg_export.svg")
    })

    $(btn_save_data).click(()=>{
        vor.save_seeds("seeds.json")
    })
    //$(in_export_ratio).change((e)=>{
    //    vor.export_ratio = in_export_ratio.value
    //    if(vor.export_ratio == 1.0){
    //        in_export_ratio.value = null
    //        in_export_ratio.setAttribute("placeholder",`1 unit = 1 pixel`)
    //    }
    //})
    //$(in_export_ratio).dblclick((e)=>{
    //    vor.export_ratio = (1425.0 / 377.031)
    //    in_export_ratio.value = vor.export_ratio
    //})
}

function menu_shape_space_min(parent){
    html(parent,/*html*/`<a style="margin:10px">Cells shape</a>`)
    const cells_shapes = ["edges","quadratic","cubic"]
    const shape_index = cells_shapes.findIndex((shape)=>{return (shape == vor.cells_shape)})
    let rg_groups = bs.radio_group(parent,"shapes",cells_shapes,shape_index)

    let space_label = html(parent,/*html*/`<a style="margin:10px">Space between cells ${vor.cells_space}</a>`)
    let rg_space = bs.input_range(parent,30)
    rg_space.step = 0.2
    rg_space.value = vor.cells_space
    let in_label = html(parent,/*html*/`<a style="margin:10px">min cell edge ${vor.min_edge}</a>`)
    const max_min_cell_edge = 100
    let rg_min_edge = bs.input_range(parent,max_min_cell_edge)
    rg_min_edge.value = vor.min_edge

    let rg_debug = bs.input_range(parent,vor.seeds.config.nb_seeds)
    rg_debug.value = 0

    if(vor.cells_shape == "cubic"){
        in_label.style.visibility = "visible"
        rg_min_edge.style.visibility = "visible"
    }else{
        in_label.style.visibility = "hidden"
        rg_min_edge.style.visibility = "hidden"
    }

    rg_groups.forEach((el)=>{
        $(el).change((e)=>{
            vor.cells_shape = e.target.getAttribute("data-label")
            vor.draw()
            if(vor.cells_shape == "cubic"){
                in_label.style.visibility = "visible"
                rg_min_edge.style.visibility = "visible"
            }else{
                in_label.style.visibility = "hidden"
                rg_min_edge.style.visibility = "hidden"
            }
        })
    })

    $(rg_space).on("input",(e)=>{
        vor.cells_space = rg_space.value
        space_label.innerHTML = `Space between cells ${vor.cells_space}`
        vor.draw()
    })
    $(rg_min_edge).on("input",(e)=>{
        vor.min_edge = rg_min_edge.value
        in_label.innerHTML = `min cell edge ${vor.min_edge}`
        vor.draw()
    })
    $(rg_debug).on("input",(e)=>{
        vor.update({cell_debug:rg_debug.value})
    })
}

function menu_generate_view(parent){
    let btn_seeds = bs.button(parent,"btn_seed",`generate seeds`);
    const lst = vor.view_svg
    const view_states = [lst.cells,lst.edges,lst.seeds]
    bs.checkbox_group(parent,"cbx_view",["cells","edges","seeds"],view_states,(e)=>{
                            vor.view_svg[e.target.getAttribute("data-name")] = e.target.checked
                            vor.draw()
                        })
    $(btn_seeds).click((e)=>{
        vor.update_seeds({clear:true})//clear = true
    })

    let list = ["circle","cell","clear"]
    bs.dropdown(parent,"Select Shape",list,list,(e)=>{
        vor.update({path_file:e.target.getAttribute("data-label")})
    })

    list = ["grad_hor","center","grad_vert_up_down","spiral_1","spiral_2","conical","clear"]
    bs.dropdown(parent,"Select Map",list,list,(e)=>{
        vor.update({map:e.target.getAttribute("data-label"),w:vor.width,h:vor.height})
    })

}

function menu_nb_seeds(parent){
    let scfg = vor.seeds.config
    html(parent,/*html*/`<a style="margin:10px">Seeds Number</a>`)
    let in_nb_seeds = bs.input_text(parent,"in_nb_seed",`${scfg.nb_seeds} seeds`,"w-100");
    let rg_nb_seeds = bs.input_range(parent,scfg.max_seeds)
    rg_nb_seeds.value = scfg.nb_seeds
    let in_max_seeds = bs.input_text(parent,"in_max_seed",`set to increase max seeds, ${scfg.max_seeds}`,"w-100");

    let toggle_walls = bs.toggle(parent,"walls away","walls stick")
    toggle_walls.checked = scfg.walls_dist
    let in_sampling  = bs.input_text(parent,"in_nb_samples",`${scfg.nb_samples} samples`,"w-50");

    $(rg_nb_seeds).on("input",(e)=>{
        in_nb_seeds.value = rg_nb_seeds.value
        vor.update_seeds({nb_seeds:rg_nb_seeds.value})
    })

    $(in_nb_seeds).change(()=>{
        let update = {}
        if(in_nb_seeds.value > scfg.max_seeds){
            rg_nb_seeds.max = in_nb_seeds.value
            rg_nb_seeds.value = in_nb_seeds.value
            update.max_seeds = in_nb_seeds.value
            in_max_seeds.setAttribute("placeholder",`max seeds ${update.max_seeds}`)
            in_max_seeds.value = null
        }
        rg_nb_seeds.value = in_nb_seeds.value
        update.nb_seeds = rg_nb_seeds.value
        vor.update_seeds(update)
    })
    $(in_max_seeds).change(()=>{
        rg_nb_seeds.max = in_max_seeds.value
        vor.update_seeds({max_seeds:in_max_seeds.value})
    })

    $(toggle_walls).change(()=>{
        vor.update_seeds({clear:true,walls_dist:toggle_walls.checked})
    })
    $(in_sampling).change(()=>{
        vor.update_seeds({clear:true,nb_samples:in_sampling.value})
    })

}

function menu_svg_size(parent){
    let scfg = vor.seeds.config
    html(parent,/*html*/`<a style="margin:5px">View width</a>`)
    let in_width = bs.input_text(parent,"in_width",`width`,"w-100");
    in_width.value = vor.width
    html(parent,/*html*/`<a style="margin:5px">View height</a>`)
    let in_height = bs.input_text(parent,"in_height",`height`,"w-100");
    in_height.value = vor.height

    let label_cost = html(parent,/*html*/`<a style="margin:5px">Map Cost Vs Dist ${scfg.map_vs_dist}</a>`)
    let rg_cost = bs.input_range(parent,scfg.map_vs_dist_max,scfg.map_vs_dist)
    $(rg_cost).on("input",(e)=>{
        label_cost.innerHTML = `Map Cost Vs Dist ${rg_cost.value}`
        vor.update({map_vs_dist:rg_cost.value})
    })
    let rg_map = bs.input_range(parent,scfg.map_power_range.max,scfg.map_power)
    rg_map.min = scfg.map_power_range.min
    rg_map.step = scfg.map_power_range.step
    $(rg_map).on("input",(e)=>{
        console.log(`Map Power ${rg_map.value}`)
        vor.update({map_power:rg_map.value})
    })


    $(in_width).change(()=>{
        vor.resize(in_width.value,in_height.value)
        grid.resize(col_svg,in_width.value,in_height.value)
    })

    $(in_height).change(()=>{
        vor.resize(in_width.value,in_height.value)
        grid.resize(col_svg,in_width.value,in_height.value)
    })

}

function menu_mouse(parent){
    html(parent,/*html*/`<a style="margin:10px">Mouse</a>`)
    const actions_array = ["add","move","remove"]
    const action_index = actions_array.findIndex((action)=>{return (action == vor.mouse_action)})
    bs.radio_group(parent,"actions",actions_array,action_index,(e)=>{
        vor.mouse_action = e.target.getAttribute("data-label")
        vor.store()
    })

    html(parent,/*html*/`<a style="margin:10px">View</a>`)
    bs.checkbox_group(parent,"cbx_shape",["view_shape"],[vor.shape.config.view_shape],(e)=>{
        let msg = {}
        msg[e.target.getAttribute("data-name")] = e.target.checked
        vor.update(msg)
    })
    bs.checkbox_group(parent,"cbx_map",["view_map"],[vor.shape.config.view_map],(e)=>{
        let msg = {}
        msg[e.target.getAttribute("data-name")] = e.target.checked
        vor.update(msg)
    })
}

function main(){

    col_svg = grid.get_div({width:vor.width,height:vor.height})
    let col0 = grid.get_div({width:160,height:220})
    let col1 = grid.get_div({width:360,height:200})
    let col2 = grid.get_div({width:120,height:200})
    let col3 = grid.get_div({width:160,height:200})
    let col4 = grid.get_div({width:240,height:200})

    let col5 = grid.get_div({width:240,height:120})
    let col6 = grid.get_div({width:120,height:120})
    let col7 = grid.get_div({width:120,height:120})
    let col8 = grid.get_div({width:240,height:120})
    let col9 = grid.get_div({width:240,height:120})

    grid.apply()

    menu_generate_view(col0)
    menu_nb_seeds(col1)
    menu_mouse(col2)
    menu_svg_size(col3)
    menu_shape_space_min(col4)

    menu_export(col5,col6,col7,col8,col9)

    vor.set_parent_only(col_svg)
    vor.update_seeds({clear:true})

}



main();

