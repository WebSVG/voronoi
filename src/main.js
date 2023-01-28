import {hr,html, br,} from "./web-js-utils.js"
import {Bootstrap} from "./bs_utils.js"
import {voronoi_app} from "./voronoi_app.js"
import {Grid} from "./scale-grid.js"

const b = document.body
let vor = new voronoi_app()
let bs = new Bootstrap()
let grid = new Grid(b,120)
let col_svg = null
let menu = {}

function show_unit(){
    if(vor.use_unit){
        const width_unit = vor.width / vor.unit_ratio
        const height_unit = vor.height / vor.unit_ratio
        document.getElementById("l_width").innerHTML = `View width (${width_unit.toFixed(2)})`
        document.getElementById("l_height").innerHTML = `View height (${height_unit.toFixed(2)})`
    }else{
        document.getElementById("l_width").innerHTML =  "View width"
        document.getElementById("l_height").innerHTML = "View height"
    }
}

function menu_shape(parent){
    let [col_sampling,col_display] = bs.cols(parent,2)
    html(col_sampling,/*html*/`<h5 style="margin-bottom:5px;color:#1F7BFD">Shape</h5>`)

    function view_shape_menu(visible){
        $("#hd_shape_display")[0].style.visibility = visible?"visible":"hidden"
        $("#rgg_map")[0].style.visibility = visible?"visible":"hidden"
        $("#rgg_shape")[0].style.visibility = visible?"visible":"hidden"
        $("#cbx_shape")[0].style.visibility = visible?"visible":"hidden"
        grid.resize(parent,visible?240:120,240)
    }

    let list = ["circle","cell","giraffe","clear"]
    bs.dropdown(col_sampling,"Select",list,list,(e)=>{
        const selected = e.target.getAttribute("data-label")
        vor.update({path_file:e.target.getAttribute("data-label")})
        view_shape_menu((selected!="clear"))
    })

    let rg_list = vor.shape.seeds_action_list
    let sact_index = rg_list.findIndex((shape)=>{return (shape == vor.shape.config.seeds_action)})
    let rg_seeds = bs.radio_group(col_sampling,"rgg_map",rg_list,sact_index)
    rg_seeds.forEach((el)=>{$(el).change((e)=>{vor.update({shape_seeds:e.target.getAttribute("data-label")})})})

    html(col_display,/*html*/`<h5 id="hd_shape_display" style="margin-bottom:5px;color:#1F7BFD">Display</h5>`)
    rg_list = vor.shape.cells_action_list
    sact_index = rg_list.findIndex((shape)=>{return (shape == vor.shape.config.cells_action)})
    let rg_cells = bs.radio_group(col_display,"rgg_shape",rg_list,sact_index)
    rg_cells.forEach((el)=>{$(el).change((e)=>{vor.update({shape_cells:e.target.getAttribute("data-label")})})})

    bs.checkbox_group(col_sampling,"cbx_shape",["visible"],[vor.shape.config.view_shape],(e)=>{
        vor.update({view_shape:e.target.checked})
    })
    view_shape_menu(false)
}

function menu_map(parent){
    let [col_sel,col_cost] = bs.cols(parent,2)

    html(col_sel,/*html*/`<h5 style="margin-bottom:5px;color:#1F7BFD">Map</h5>`)

    function view_map_menu(visible){
        $("#cbx_map")[0].style.visibility = visible?"visible":"hidden"
        $("#map_cost_group")[0].style.visibility = visible?"visible":"hidden"
        grid.resize(parent,visible?360:120,240)
    }

    let list = ["grad_hor","center","grad_vert_up_down","spiral_1","spiral_2","conical","clear"]
    bs.dropdown(col_sel,"Select",list,list,(e)=>{
        const selected = e.target.getAttribute("data-label")
        vor.update({map:selected,w:vor.width,h:vor.height})
        view_map_menu((selected!="clear"))
    })


    bs.checkbox_group(col_sel,"cbx_map",["visible"],[vor.shape.config.view_map],(e)=>{
        vor.update({view_map:e.target.checked})
    })


    let scfg = vor.seeds.config
    let div_map_cost = html(col_cost,/*html*/`<div id="map_cost_group"></div>`)
    html(div_map_cost,/*html*/`<h5 style="margin-bottom:5px;color:#1F7BFD">Map Paramters</h5>`)
    let label_cost = html(div_map_cost,/*html*/`<a style="margin:5px">Cost Vs Dist ${scfg.map_vs_dist}</a>`)
    let rg_cost = bs.input_range(div_map_cost,scfg.map_vs_dist_max,scfg.map_vs_dist)
    $(rg_cost).on("input",(e)=>{
        label_cost.innerHTML = `Map Cost Vs Dist ${rg_cost.value}`
        vor.update({map_vs_dist:rg_cost.value})
    })
    let label_power = html(div_map_cost,/*html*/`<a style="margin:5px">Cost Power ${scfg.map_power}</a>`)
    let rg_map = bs.input_range(div_map_cost,scfg.map_power_range.max,scfg.map_power)
    rg_map.min = scfg.map_power_range.min
    rg_map.step = scfg.map_power_range.step
    $(rg_map).on("input",(e)=>{
        label_power.innerHTML = `Cost Power ${rg_map.value}`
        vor.update({map_power:rg_map.value})
    })

    view_map_menu(false)
}

function menu_export(ecol0,ecol1){
    let btn_save_svg = bs.button(ecol0,"btn_save",`export SVG`);

    let btn_save_data = bs.button(ecol0,"btn_save",`export seeds coordinates`);

    html(ecol1,/*html*/`<h5 style="margin-bottom:5px;color:#1F7BFD">Export</h5>`)
    const lst = vor.export_svg
    const export_states = [lst.cells,lst.edges,lst.seeds]
    bs.checkbox_group(ecol1,"cbx_export",["cells","edges","seeds"],export_states,(e)=>{
                            vor.export_svg[e.target.getAttribute("data-name")] = e.target.checked
                        })



    $(btn_save_svg).click(()=>{
        vor.save_svg("voronoi_svg_export.svg")
    })

    $(btn_save_data).click(()=>{
        vor.save_seeds("seeds.json")
    })
}

function menu_github_version(parent){
    html(parent,/*html*/`<a>
        <p align="center">
            <a href="https://github.com/WebSVG/voronoi" target="_blank">
            <img src=./github.png width=40 href="https://github.com/WebSVG/voronoi">
            <p align="center">User Guide and Source Code</p>
        </p>
    </a>`)
    html(parent,/*html*/`<p align="center">v10.08.2022</p>`)
}

function menu_shape_space_min(parent){
    html(parent,/*html*/`<h5 style="margin-bottom:5px;color:#1F7BFD">Cells shape</h5>`)
    const cells_shapes = ["edges","quadratic","cubic"]
    const shape_index = cells_shapes.findIndex((shape)=>{return (shape == vor.cells_shape)})
    let rg_groups = bs.radio_group(parent,"shapes",cells_shapes,shape_index)

    let pr = html(parent,/*html*/`<p style="margin-top:10px"></p>`)
    let space_label = html(pr,/*html*/`<a style="margin-top:10px">Space between cells ${vor.cells_space}</a>`)
    let rg_space = bs.input_range(pr,30)
    rg_space.step = 0.2
    rg_space.value = vor.cells_space

    let pr2 = html(parent,/*html*/`<p style="margin-top:10px"></p>`)
    let in_label = html(pr2,/*html*/`<a >min cell edge ${vor.min_edge}</a>`)
    const max_min_cell_edge = 100
    let rg_min_edge = bs.input_range(pr2,max_min_cell_edge)
    rg_min_edge.value = vor.min_edge

    let rg_debug = bs.input_range(pr2,vor.seeds.config.nb_seeds)
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
    let btn_seeds = bs.button(parent,"btn_seed",`generate`);
    const lst = vor.view_svg
    const view_states = [lst.cells,lst.edges,lst.seeds]
    bs.checkbox_group(parent,"cbx_view",["cells","edges","seeds"],view_states,(e)=>{
                            vor.view_svg[e.target.getAttribute("data-name")] = e.target.checked
                            vor.draw()
                        })
    $(btn_seeds).click((e)=>{
        vor.update_seeds({clear:true})//clear = true
    })

}

function menu_nb_seeds(parent){
    let scfg = vor.seeds.config
    html(parent,/*html*/`<h5 style="margin-bottom:5px;color:#1F7BFD">Seeds</h5>`)
    //html(parent,/*html*/`<a style="margin:10px">Seeds Number</a>`)
    let in_nb_seeds = bs.input_text(parent,"in_nb_seed",`${scfg.nb_seeds} seeds`,"w-100");
    let rg_nb_seeds = bs.input_range(parent,scfg.max_seeds)
    rg_nb_seeds.value = scfg.nb_seeds
    let in_max_seeds = bs.input_text(parent,"in_max_seed",`set to increase max seeds, ${scfg.max_seeds}`,"w-100");

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

}

function menu_sampling(parent){
    let scfg = vor.seeds.config
    html(parent,/*html*/`<h5 style="margin-bottom:5px;color:#1F7BFD">Sampling</h5>`)
    let toggle_walls = bs.toggle(parent,"walls away","walls stick")
    toggle_walls.checked = scfg.walls_dist
    let in_sampling  = bs.input_text(parent,"in_nb_samples",`${scfg.nb_samples} samples`,"w-100");

    $(toggle_walls).change(()=>{
        vor.update_seeds({clear:true,walls_dist:toggle_walls.checked})
    })
    $(in_sampling).change(()=>{
        vor.update_seeds({clear:true,nb_samples:in_sampling.value})
    })

}

function menu_scale(parent){
    let main_cb_update = (e)=>{}
    bs.checkbox_group(parent,"cbx_scale",["show_unit"],[vor.use_unit],(e)=>{main_cb_update(e)})
    let in_ratio = bs.input_text(parent,"in_ratio","Enter unit ratio","w-100");
    
    in_ratio.value = vor.unit_ratio
    function set_visibility(vis){
        in_ratio.style.visibility = vis?"visible":"hidden"
        show_unit()
    }
    set_visibility(vor.use_unit)
    main_cb_update = (e)=>{
        vor.use_unit = e.target.checked
        vor.store()
        set_visibility(e.target.checked)
    }
    $(in_ratio).change((e)=>{
        if(in_ratio.value == ""){
            in_ratio.value = vor.unit_ratio_default
        }
        vor.unit_ratio = in_ratio.value
        vor.store()
        show_unit()
    })
}

function menu_size(parent){
    html(parent,/*html*/`<h5 style="margin-bottom:5px;color:#1F7BFD">Size</h5>`)
    let scfg = vor.seeds.config
    html(parent,/*html*/`<a id="l_width" style="margin-bottom:5px">View width</a>`)
    let in_width = bs.input_text(parent,"in_width",`width`,"w-100");
    in_width.value = vor.width
    html(parent,/*html*/`<a id="l_height" style="margin-bottom:5px">View height</a>`)
    let in_height = bs.input_text(parent,"in_height",`height`,"w-100");
    in_height.value = vor.height

    $(in_width).change(()=>{
        vor.resize(in_width.value,in_height.value)
        grid.resize(menu.svg_grid_div,in_width.value,in_height.value)
        show_unit()
    })

    $(in_height).change(()=>{
        vor.resize(in_width.value,in_height.value)
        grid.resize(menu.svg_grid_div,in_width.value,in_height.value)
        show_unit()
    })

    menu.in_width = in_width
    menu.in_height = in_height
    menu_scale(parent)
}

function menu_color(parent){
    html(parent,/*html*/`<h5 style="margin-bottom:5px;color:#1F7BFD">Color</h5>`)
    let btn_color = bs.button(parent,"btn_color",`randomize colors`);

    $(btn_color).click(()=>{
        document.querySelectorAll("path").forEach(function(userPath) {
            userPath.setAttribute("fill", "hsl("+ Math.floor(Math.random() * Math.floor(255)) + ",90%,60%)");
            userPath.setAttribute("fill-opacity", "40%");
        })  
        
    })
    
}

function menu_mouse(parent){
    html(parent,/*html*/`<h5 style="margin-bottom:5px;color:#1F7BFD">Mouse</h5>`)
    //html(parent,/*html*/`<a style="margin:10px">Mouse</a>`)
    const actions_array = ["add","move","remove"]
    const action_index = actions_array.findIndex((action)=>{return (action == vor.mouse_action)})
    bs.radio_group(parent,"actions",actions_array,action_index,(e)=>{
        vor.mouse_action = e.target.getAttribute("data-label")
        vor.store()
    })

}

function menu_filters(parent){
    let diag_cfg = vor.diagram.config
    let main_cb_update = (e)=>{}
    bs.checkbox_group(parent,"cbx_filters",["use_filters"],[diag_cfg.use_filters],(e)=>{main_cb_update(e)})
    let label_disp_scale = html(parent,/*html*/`<a style="margin:5px">Displacement scale ${diag_cfg.disp_scale}</a>`)
    let rg_disp = bs.input_range(parent,diag_cfg.disp_scale_max,diag_cfg.disp_scale)
    $(rg_disp).on("input",(e)=>{
        label_disp_scale.innerHTML = `Displacement scale ${rg_disp.value}`
        vor.update({displacement:rg_disp.value})
    })

    let label_freq = html(parent,/*html*/`<a style="margin:5px">Turbulence Frequency ${diag_cfg.turb_freq}</a>`)
    let rg_freq = bs.input_range(parent,diag_cfg.turb_freq_max,diag_cfg.turb_freq)
    rg_freq.step = diag_cfg.turb_freq_step
    $(rg_freq).on("input",(e)=>{
        label_freq.innerHTML = `Turbulence Frequency ${rg_freq.value}`
        vor.update({turbulence:rg_freq.value})
    })

    function set_visibility(vis){
        label_disp_scale.style.visibility = vis?"visible":"hidden"
        rg_disp.style.visibility = vis?"visible":"hidden"
        label_freq.style.visibility = vis?"visible":"hidden"
        rg_freq.style.visibility = vis?"visible":"hidden"
    }

    set_visibility(diag_cfg.use_filters)
    main_cb_update = (e)=>{
        vor.update({filters:e.target.checked})
        set_visibility(e.target.checked)
    }
}

function menu_edges(parent){
    let diag_cfg = vor.diagram.config
    let main_cb_update = (e)=>{}
    bs.checkbox_group(parent,"cbx_filters",["Edit Edges"],[diag_cfg.edit_edges],(e)=>{main_cb_update(e)})
    let label_edge_style = html(parent,/*html*/`<a style="margin:5px">Edge Style ${diag_cfg.edge_style}</a>`)
    let rg_edges = bs.input_range(parent,diag_cfg.edge_style_max,diag_cfg.edge_style)
    $(rg_edges).on("input",(e)=>{
        label_edge_style.innerHTML = `Edge Style ${rg_edges.value}`
        vor.update({edge_style:rg_edges.value})
    })

    function set_visibility(vis){
        label_edge_style.style.visibility = vis?"visible":"hidden"
        rg_edges.style.visibility = vis?"visible":"hidden"
    }

    set_visibility(diag_cfg.edit_edges)
    main_cb_update = (e)=>{
        vor.update({edit_edges:e.target.checked})
        set_visibility(e.target.checked)
    }
}


function main(){

    menu.svg_grid_div = grid.get_div({width:vor.width,height:vor.height})
    vor.set_parent_only(menu.svg_grid_div)
    menu_generate_view(  grid.get_div({width:120,height:120}))
    menu_nb_seeds(       grid.get_div({width:240,height:120}))
    menu_sampling(       grid.get_div({width:120,height:120}))
    menu_mouse(          grid.get_div({width:120,height:240}))
    menu_color(          grid.get_div({width:120,height:240}))
    menu_size(          grid.get_div({width:180,height:240}))
    menu_shape_space_min(grid.get_div({width:240,height:240}))

    let col_exp_buttons = grid.get_div({width:240,height:120})
    let col_exp_select = grid.get_div({width:120,height:120})
    menu_export(col_exp_buttons,col_exp_select)

    menu_shape(grid.get_div({width:120,height:240}))
    menu_map(grid.get_div({width:120,height:240}))

    menu_filters(grid.get_div({width:240,height:120}))
    menu_edges(grid.get_div({width:240,height:120}))
    menu_github_version(grid.get_div({width:240,height:120}))

    grid.apply()

    vor.update_seeds({clear:true,width:vor.width,height:vor.height})

    window.addEventListener("main_window",onMainWindow,false)
}

function onMainWindow(e){
    const width = e.detail.width
    const height = e.detail.height
    menu.in_width.value = width
    menu.in_height.value = height
    vor.resize(width,height,{clear:false})
    grid.resize(col_svg,width,height)
}


main();

