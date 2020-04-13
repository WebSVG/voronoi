import {hr,html, br,} from "./utils.js"
import {Bootstrap} from "./bs_utils.js"
import {Voronoi} from "./voronoi_svg.js"

const b = document.body
let vor = new Voronoi(b,"100%","60%")
let bs = new Bootstrap()

function menu_export(parent){
    let [ecol0,ecol1,ecol2,ecol3] = bs.cols(parent,4,["col-2","col-2","col","col"])
    let btn_save_svg = bs.button(ecol0,"btn_save",`export SVG`);
    const export_states = [vor.export_svg.cells,vor.export_svg.edges,vor.export_svg.seeds]
    bs.checkbox_group(ecol1,"cbx_export",["cells","edges","seeds"],export_states,(e)=>{
                            vor.export_svg[e.target.getAttribute("data-name")] = e.target.checked
                        })
    let btn_save_data = bs.button(ecol2,"btn_save",`export seeds coordinates`);
    html(ecol2,"a",/*html*/`<a align="center">version bea9a07d373ff99</p>`)
    html(ecol2,"a",/*html*/`<a style="margin:10px">Drag and drop 'seeds.json' to import</p>`)

    html(ecol3,"a",/*html*/`<a>
        <p align="center">
            <a href="https://github.com/WebSVG/voronoi" target="_blank">
            <img src=./media/github.png width=40 href="https://github.com/WebSVG/voronoi">
            <p align="center">User Guide and Source Code</p>
        </p>
    </a>`)


    $(btn_save_svg).click(()=>{
        vor.save_svg("voronoi_svg_export.svg")
    })

    $(btn_save_data).click(()=>{
        vor.save_seeds("seeds.json")
    })
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

    let rg_debug = bs.input_range(parent,vor.nb_seeds)
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
            vor.update_seeds()
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
        vor.seed_debug = rg_debug.value
        vor.draw()
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
        vor.update_seeds(true)//clear = true
    })

}

function menu_nb_seeds(parent){
    html(parent,"a",/*html*/`<a style="margin:10px">Seeds Number</a>`)
    let in_nb_seeds = bs.input_text(parent,"in_nb_seed",`${vor.nb_seeds} seeds`,"w-100");
    let rg_nb_seeds = bs.input_range(parent,vor.max_seeds)
    rg_nb_seeds.value = vor.nb_seeds
    let in_max_seeds = bs.input_text(parent,"in_max_seed",`max seeds ${vor.max_seeds}`,"w-100");

    let toggle_walls = bs.toggle(parent,"walls away","walls stick")
    toggle_walls.checked = vor.walls_dist
    let toggle_alg   = bs.toggle(parent,"Sampling","Single")
    toggle_alg.checked = vor.sampling
    let in_sampling  = bs.input_text(parent,"in_nb_samples",`${vor.nb_samples} samples`);

    $(rg_nb_seeds).on("input",(e)=>{
        in_nb_seeds.value = rg_nb_seeds.value
        vor.nb_seeds = rg_nb_seeds.value
        vor.update_seeds(false)
    })

    $(in_nb_seeds).change(()=>{
        if(in_nb_seeds.value > vor.max_seeds){
            vor.max_seeds = in_nb_seeds.value
            rg_nb_seeds.max = vor.max_seeds
            in_max_seeds.setAttribute("placeholder",`max seeds ${vor.max_seeds}`)
            in_max_seeds.value = null
        }
        rg_nb_seeds.value = in_nb_seeds.value
        vor.nb_seeds = rg_nb_seeds.value
        vor.update_seeds()
    })
    $(in_max_seeds).change(()=>{
        rg_nb_seeds.max = in_max_seeds.value
        vor.max_seeds = in_max_seeds.value
        vor.store()
    })

    $(toggle_walls).change(()=>{
        vor.walls_dist = toggle_walls.checked
        vor.update_seeds(true)//clear = true
    })
    $(toggle_alg).change(()=>{
        vor.sampling = toggle_alg.checked
        in_sampling.style.visibility = toggle_alg.checked?"visible":"hidden"
        vor.update_seeds(true)//clear = true
    })
    $(in_sampling).change(()=>{
        vor.nb_samples = in_sampling.value
        vor.update_seeds(true)//clear = true
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

function main(){

    hr(b)
    let [col0,col1,col2,col3,col4] = bs.cols(b,5,["col-2","col-4","col-1","col-2","col"])

    menu_generate_view(col0)
    menu_nb_seeds(col1)
    menu_shape_space_min(col4)

    html(col2,"a",/*html*/`<a style="margin:10px">Mouse</a>`)
    const actions_array = ["add","move","remove"]
    const action_index = actions_array.findIndex((action)=>{return (action == vor.mouse_action)})
    bs.radio_group(col2,"actions",actions_array,action_index,(e)=>{
        vor.mouse_action = e.target.getAttribute("data-label")
        vor.store()
    })
    hr(b)
    menu_export(b)

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
            vor.load_dropped_seeds(event.dataTransfer.files[0]);
        }
    };
}

main();

