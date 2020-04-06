import {    input_range,input_text,button,hr,cols,toggle,html,
            save_svg,radio_group,checkbox_group} from "./utils.js"
import {Voronoi} from "./index.js"

const b = document.body
let vor = new Voronoi(b,"100%","70%")
const default_nb_seeds = 30;

function main(){

    let seeds_cols = cols(b,4,["col-4","col","col-3","col-1"])
    //html(seeds_cols[0],"a",/*html*/`<h4 style="margin:10px">Distance</h4>`)
    let toggle_walls = toggle(seeds_cols[0],"walls away","walls stick")
    let toggle_alg = toggle(seeds_cols[0],"Sampling","Single")
    let in_sampling = input_text(seeds_cols[0],"in_nb_samples",`${vor.nb_samples} samples`);

    html(seeds_cols[0],"a",/*html*/`<a style="margin:10px">Edges thickness</a>`)
    let rg_path_width = input_range(seeds_cols[0],30)
    rg_path_width.value = vor.path_width

    //br(seeds_cols[0])
    let btn_seeds = button(seeds_cols[1],"btn_seed",`generate seeds`);
    //let toggle_seeds = toggle(seeds_cols[1],"visible","hidden")

    const view_states = [vor.view_svg.cells,vor.view_svg.edges,vor.view_svg.seeds]
    checkbox_group(seeds_cols[1],"cbx_view",["cells","edges","seeds"],view_states,(e)=>{
        vor.view_svg[e.target.getAttribute("data-name")] = e.target.checked
        vor.set_visibility()
    })
    //html(seeds_cols[1],"a",/*html*/`<a style="margin:10px">runtime ms</a>`)

    let in_nb_seeds = input_text(seeds_cols[2],"in_nb_seed",`${default_nb_seeds} seeds`,"w-100");
    //html(seeds_cols[2],"a",/*html*/`<a style="margin:10px">number of seeds</a>`)
    let rg_nb_seeds = input_range(seeds_cols[2],default_nb_seeds * 2)
    let in_max_seeds = input_text(seeds_cols[2],"in_max_seed",`max seeds ${default_nb_seeds*2}`,"w-100");

    vor.mouse_action = "move"
    radio_group(seeds_cols[3],["add","move","remove"],1,(e)=>{
        vor.mouse_action = e.target.getAttribute("data-action")
    })

    hr(b)

    let exp_cols = cols(b,3,["col-2","col-2","col"])
    let btn_save_svg = button(exp_cols[0],"btn_save",`export SVG`);
    const export_states = [vor.export_svg.cells,vor.export_svg.edges,vor.export_svg.seeds]
    checkbox_group(exp_cols[1],"cbx_export",["cells","edges","seeds"],export_states,(e)=>{
        vor.export_svg[e.target.getAttribute("data-name")] = e.target.checked
    })

    let btn_save_data = button(exp_cols[2],"btn_save",`export seeds coordinates`);
    html(exp_cols[2],"h4",/*html*/`<a style="margin:10px">Drag and drop 'seeds.json' to import</a>`)


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
        vor.run(rg_nb_seeds.value,true)//clear = true
    })

    vor.walls_dist = true
    $(toggle_walls).change(()=>{
        vor.walls_dist = toggle_walls.checked
        vor.run(rg_nb_seeds.value,true)//clear = true
    })

    $(btn_seeds).click((e)=>{
        vor.run(rg_nb_seeds.value,true)//clear = true
    })

    $(rg_nb_seeds).on("input",(e)=>{
        in_nb_seeds.value = rg_nb_seeds.value
        vor.run(rg_nb_seeds.value)
    })

    $(rg_path_width).on("input",(e)=>{
        vor.set_path_width(rg_path_width.value)
    })

    $(in_nb_seeds).change(()=>{
        rg_nb_seeds.value = in_nb_seeds.value
        vor.run(rg_nb_seeds.value)
    })
    $(in_max_seeds).change(()=>{rg_nb_seeds.max = in_max_seeds.value})
    $(in_sampling).change(()=>{
        vor.nb_samples = in_sampling.value
        vor.run(rg_nb_seeds.value,true)//clear = true
    })

    $(document).ready(()=>{
        vor.run(rg_nb_seeds.value)
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

