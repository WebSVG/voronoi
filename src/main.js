import {hr,html, br,} from "./utils.js"
import {Bootstrap} from "./bs_utils.js"
import {voronoi_app} from "./voronoi_app.js"

const b = document.body
let vor = new voronoi_app(b,"100%","60%")
let bs = new Bootstrap()

function menu_export(parent){
    br(parent)
    let [ecol0,ecol1,ecol2,ecol3,ecol4] = bs.cols(parent,5,["col-3","col-1","col-2","col-2","col"])
    let btn_save_svg = bs.button(ecol0,"btn_save",`export SVG`);

    //let in_export_ratio = bs.input_text(ecol0,"in_export_ratio",`${vor.export_ratio}`,"w-50");
    //in_export_ratio.style.visibility = "hidden"
    //if(vor.export_ratio == 1.0){
    //    in_export_ratio.value = null
    //    in_export_ratio.setAttribute("placeholder",`1 unit = 1 pixel`)
    //}
    let btn_save_data = bs.button(ecol0,"btn_save",`export seeds coordinates`);

    html(ecol1,"p",/*html*/`<p align="center">Export</p>`)
    const export_states = [vor.export_svg.cells,vor.export_svg.edges,vor.export_svg.seeds]
    bs.checkbox_group(ecol1,"cbx_export",["cells","edges","seeds"],export_states,(e)=>{
                            vor.export_svg[e.target.getAttribute("data-name")] = e.target.checked
                        })
    //html(ecol2,"a",/*html*/`<a style="margin:10px">Drag and drop 'seeds.json' to import</p>`)



    html(ecol2,"p",/*html*/`<p align="center">Shape Cells</p>`)
    let rg_list = vor.shape.cells_action_list
    let sact_index = rg_list.findIndex((shape)=>{return (shape == vor.shape.config.cells_action)})
    let rg_cells = bs.radio_group(ecol2,"rgg_shape_cells",rg_list,sact_index)
    rg_cells.forEach((el)=>{$(el).change((e)=>{vor.update({shape_cells:e.target.getAttribute("data-label")})})})

    html(ecol3,"p",/*html*/`<p align="center">Seeds Sampling</p>`)
    rg_list = vor.shape.seeds_action_list
    sact_index = rg_list.findIndex((shape)=>{return (shape == vor.shape.config.seeds_action)})
    let rg_seeds = bs.radio_group(ecol3,"rgg_shpae_seeds",rg_list,sact_index)
    rg_seeds.forEach((el)=>{$(el).change((e)=>{vor.update({shape_seeds:e.target.getAttribute("data-label")})})})

    bs.checkbox_group(ecol2,"cbx_shape",["debug"],[vor.shape.config.debug],(e)=>{
                            let msg = {}
                            msg[e.target.getAttribute("data-name")] = e.target.checked
                            vor.update(msg)
                        })


    html(ecol4,"a",/*html*/`<a>
        <p align="center">
            <a href="https://github.com/WebSVG/voronoi" target="_blank">
            <img src=./media/github.png width=40 href="https://github.com/WebSVG/voronoi">
            <p align="center">User Guide and Source Code</p>
        </p>
    </a>`)
    html(ecol4,"p",/*html*/`<p align="center">v18.04.2020</p>`)

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
    html(parent,"a",/*html*/`<a style="margin:10px">Cells shape</a>`)
    const cells_shapes = ["edges","quadratic","cubic"]
    const shape_index = cells_shapes.findIndex((shape)=>{return (shape == vor.cells_shape)})
    let rg_groups = bs.radio_group(parent,"shapes",cells_shapes,shape_index)

    let space_label = html(parent,"a",/*html*/`<a style="margin:10px">Space between cells ${vor.cells_space}</a>`)
    let rg_space = bs.input_range(parent,30)
    rg_space.step = 0.2
    rg_space.value = vor.cells_space
    let in_label = html(parent,"a",/*html*/`<a style="margin:10px">min cell edge ${vor.min_edge}</a>`)
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
    const view_states = [vor.view_svg.cells,vor.view_svg.edges,vor.view_svg.seeds]
    bs.checkbox_group(parent,"cbx_view",["cells","edges","seeds"],view_states,(e)=>{
                            vor.view_svg[e.target.getAttribute("data-name")] = e.target.checked
                            vor.draw()
                        })
    $(btn_seeds).click((e)=>{
        vor.update_seeds({clear:true})//clear = true
    })

    const list = ["cell","circle","face"]
    bs.dropdown(parent,"Select Shape",list,list,(e)=>{
        vor.update({path_file:e.target.getAttribute("data-label")})
    })

}

function menu_nb_seeds(parent){
    let scfg = vor.seeds.config
    html(parent,"a",/*html*/`<a style="margin:10px">Seeds Number</a>`)
    let in_nb_seeds = bs.input_text(parent,"in_nb_seed",`${scfg.nb_seeds} seeds`,"w-100");
    let rg_nb_seeds = bs.input_range(parent,scfg.max_seeds)
    rg_nb_seeds.value = scfg.nb_seeds
    let in_max_seeds = bs.input_text(parent,"in_max_seed",`enter max seeds, current ${scfg.max_seeds}`,"w-100");

    let toggle_walls = bs.toggle(parent,"walls away","walls stick")
    toggle_walls.checked = scfg.walls_dist
    let in_sampling  = bs.input_text(parent,"in_nb_samples",`${scfg.nb_samples} samples`);

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
    html(parent,"a",/*html*/`<a style="margin:5px">View width height</a>`)
    let in_width = bs.input_text(parent,"in_width",`${vor.max_width} max width`,"w-100");
    let rg_width = bs.input_range(parent,vor.max_width)
    rg_width.value = vor.width
    if(vor.width != vor.max_width){
        in_width.value = vor.width
    }
    let in_height = bs.input_text(parent,"in_height",`${vor.max_height} max height`,"w-100");
    let rg_height = bs.input_range(parent,vor.max_height)
    rg_height.value = vor.height
    if(vor.height != vor.max_height){
        in_height.value = vor.height
    }

    $(in_width).change(()=>{
        if(in_width.value <= vor.max_width){
            rg_width.value = in_width.value
            vor.width = in_width.value
        }
        if(in_width.value >= vor.max_width){
            in_width.value = null
            rg_width.value = vor.max_width
            vor.width = vor.max_width
        }
        vor.update_size(false)
    })

    $(in_height).change(()=>{
        if(in_height.value <= vor.max_height){
            rg_height.value = in_height.value
            vor.height = in_height.value
        }
        if(in_height.value >= vor.max_height){
            in_height.value = null
            rg_height.value = vor.max_height
            vor.height = vor.max_height
        }
        vor.update_size(false)
    })

    $(rg_width).on("input",(e)=>{
        in_width.value = rg_width.value
        vor.width = in_width.value
        if(rg_width.value == vor.max_width){
            in_width.value = null
        }
        vor.update_size(false)
    })

    $(rg_height).on("input",(e)=>{
        in_height.value = rg_height.value
        vor.height = in_height.value
        if(rg_height.value == vor.max_height){
            in_height.value = null
        }
        vor.update_size(false)
    })
}

function menu_mouse(parent){
    html(parent,"a",/*html*/`<a style="margin:10px">Mouse</a>`)
    const actions_array = ["add","move","remove"]
    const action_index = actions_array.findIndex((action)=>{return (action == vor.mouse_action)})
    bs.radio_group(parent,"actions",actions_array,action_index,(e)=>{
        vor.mouse_action = e.target.getAttribute("data-label")
        vor.store()
    })
}

function main(){

    let bs_cols = []
    let exp_col;

    if(vor.vertical_view){
        let [svg_col,menu_col] = bs.cols(b,2,["col","col"])
        let [r1_col1,r1_col2,r1_col3] = bs.cols(menu_col,3,["col-4","col","col-1"])
        let [r2_col1,r2_col2] = bs.cols(menu_col,2,["col-4","col"])
        bs_cols = [r1_col1,r1_col2,r1_col3,r2_col1,r2_col2]
        vor.change_parent(svg_col,"100%","100%")
        exp_col = menu_col
    }else{
        bs_cols = bs.cols(b,5,["col-2","col-4","col-1","col-2","col"])
        exp_col = b
    }

    let [col0,col1,col2,col3,col4] = bs_cols

    menu_generate_view(col0)
    menu_nb_seeds(col1)
    menu_shape_space_min(col4)
    menu_mouse(col2)

    menu_export(exp_col)

    $(document).ready(()=>{
        vor.update_size(true)
        menu_svg_size(col3)
    })
    $(window).resize(()=>{
        vor.update_size(false)
        //should update the range slider here
    })

    init_drag_events()
}

function init_drag_events(){
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		document.addEventListener(eventName, onDragEvents, false)
	});
}

function onDragEvents(event){
    event.stopPropagation();
    event.preventDefault();
    if(event.type == "dragenter"){
        event.dataTransfer.dropEffect = "copy";
    }
    if(event.type == "drop"){
        if(event.dataTransfer.files.length != 1){
            alert("only one file allowed");
            console.log(event.dataTransfer.files);
            return;
        }else{
            vor.load_dropped_file(event.dataTransfer.files[0]);
        }
    };
}

main();

