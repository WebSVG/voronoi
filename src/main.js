import {hr,html,} from "./utils.js"
import {Bootstrap} from "./bs_utils.js"
import {Voronoi} from "./index.js"

const b = document.body
let vor = new Voronoi(b,"100%","70%")
let bs = new Bootstrap()

function main(){

    let [col0,col1,col2,col3] = bs.cols(b,4,["col-4","col","col-3","col-1"])

    //col0
    let toggle_walls = bs.toggle(col0,"walls away","walls stick")
    let toggle_alg   = bs.toggle(col0,"Sampling","Single")
    let in_sampling  = bs.input_text(col0,"in_nb_samples",`${vor.nb_samples} samples`);
    html(col0,"a",/*html*/`<a style="margin:10px">Edges thickness</a>`)
    let rg_path_width = bs.input_range(col0,30)
    rg_path_width.value = vor.path_width
    html(col0,"a",/*html*/`<a style="margin:10px">min edge cells (still buggy)</a>`)
    let rg_min_edge = bs.input_range(col0,50)

    //col1
    let btn_seeds = bs.button(col1,"btn_seed",`generate seeds`);
    const view_states = [vor.view_svg.cells,vor.view_svg.edges,vor.view_svg.seeds]
    bs.checkbox_group(col1,"cbx_view",["cells","edges","seeds"],view_states,(e)=>{
                            vor.view_svg[e.target.getAttribute("data-name")] = e.target.checked
                            vor.draw()
                        })

    //col2
    let in_nb_seeds = bs.input_text(col2,"in_nb_seed",`${vor.nb_seeds} seeds`,"w-100");
    //html(col2,"a",/*html*/`<a style="margin:10px">number of seeds</a>`)
    let rg_nb_seeds = bs.input_range(col2,vor.nb_seeds * 2)
    rg_nb_seeds.value = vor.nb_seeds
    let in_max_seeds = bs.input_text(col2,"in_max_seed",`max seeds ${vor.nb_seeds*2}`,"w-100");

    //col3
    vor.mouse_action = "move"
    bs.radio_group(col3,["add","move","remove"],1,(e)=>{
                        vor.mouse_action = e.target.getAttribute("data-action")
                    })

    //bottom
    hr(b)
    let [ecol0,ecol1,ecol2] = bs.cols(b,3,["col-2","col-2","col"])
    let btn_save_svg = bs.button(ecol0,"btn_save",`export SVG`);
    const export_states = [vor.export_svg.cells,vor.export_svg.edges,vor.export_svg.seeds]
    bs.checkbox_group(ecol1,"cbx_export",["cells","edges","seeds"],export_states,(e)=>{
                            vor.export_svg[e.target.getAttribute("data-name")] = e.target.checked
                        })
    let btn_save_data = bs.button(ecol2,"btn_save",`export seeds coordinates`);
    html(ecol2,"h4",/*html*/`<a style="margin:10px">Drag and drop 'seeds.json' to import</a>`)


    //logic
    $(btn_save_svg).click(()=>{
        vor.save_svg("voronoi_svg_export.svg")
    })

    $(btn_save_data).click(()=>{
        vor.save_seeds("seeds.json")
    })

    vor.sampling = true
    $(toggle_alg).change(()=>{
        vor.sampling = toggle_alg.checked
        in_sampling.style.visibility = toggle_alg.checked?"visible":"hidden"
        vor.run(true)//clear = true
    })

    vor.walls_dist = true
    $(toggle_walls).change(()=>{
        vor.walls_dist = toggle_walls.checked
        vor.run(true)//clear = true
    })

    $(btn_seeds).click((e)=>{
        vor.run(true)//clear = true
    })

    $(rg_nb_seeds).on("input",(e)=>{
        in_nb_seeds.value = rg_nb_seeds.value
        vor.nb_seeds = rg_nb_seeds.value
        vor.run()
    })

    $(rg_path_width).on("input",(e)=>{
        vor.set_path_width(rg_path_width.value)
    })
    $(rg_min_edge).on("input",(e)=>{
        vor.min_edge = rg_min_edge.value
        vor.draw()
    })
    

    $(in_nb_seeds).change(()=>{
        rg_nb_seeds.value = in_nb_seeds.value
        vor.nb_seeds = rg_nb_seeds.value
        vor.run()
    })
    $(in_max_seeds).change(()=>{rg_nb_seeds.max = in_max_seeds.value})
    $(in_sampling).change(()=>{
        vor.nb_samples = in_sampling.value
        vor.run(true)//clear = true
    })

    $(document).ready(()=>{
        vor.run(true)
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

