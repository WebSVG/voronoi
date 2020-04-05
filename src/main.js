import {input_range,input_text,button,hr,cols,toggle,html,save_svg,radio_group} from "./utils.js"
import {Voronoi} from "./index.js"

const b = document.body
let vor = new Voronoi(b)
const default_nb_seeds = 50;
const nb_samples = 10

function main(){

    let seeds_cols = cols(b,4)
    //html(seeds_cols[0],"a",/*html*/`<h4 style="margin:10px">Distance</h4>`)
    let toggle_alg = toggle(seeds_cols[0],"Sampling","Single")
    let in_sampling = input_text(seeds_cols[0],"in_nb_samples",`${nb_samples} samples`);
    let toggle_walls = toggle(seeds_cols[0],"walls away","walls stick")
    //br(seeds_cols[0])
    let btn_seeds = button(seeds_cols[1],"btn_seed",`generate seeds`);
    let in_nb_seeds = input_text(seeds_cols[1],"in_nb_seed",`${default_nb_seeds} seeds`);
    let toggle_seeds = toggle(seeds_cols[1],"visible","hidden")

    let rg_nb_seeds = input_range(seeds_cols[2],default_nb_seeds * 2)
    let in_max_seeds = input_text(seeds_cols[2],"in_max_seed",`max seeds ${default_nb_seeds*2}`,"w-100");

    vor.mouse_action = "move"
    radio_group(seeds_cols[3],["add","move","remove"],1,(e)=>{
        vor.mouse_action = e.target.getAttribute("data-action")
    })

    hr(b)
    let btn_save_svg = button(b,"btn_save",`export SVG`);
    let toggle_export_seeds = toggle(b,"seeds","no seeds")
    toggle_export_seeds.checked = false

    let btn_save_data = button(b,"btn_save",`export seeds coordinates`);
    html(b,"h4",/*html*/`<a style="margin:10px">Drag and drop 'seeds.json' to import</a>`)


    $(btn_save_svg).click(()=>{
        vor.view_seeds(toggle_export_seeds.checked)
        save_svg(vor.svg,"voronoi_svg_export.svg")
        vor.view_seeds(toggle_seeds.checked)
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

    $(in_nb_seeds).change(()=>{
        rg_nb_seeds.value = in_nb_seeds.value
        vor.run(rg_nb_seeds.value)
    })
    $(in_max_seeds).change(()=>{rg_nb_seeds.max = in_max_seeds.value})
    vor.nb_samples = nb_samples
    $(in_sampling).change(()=>{
        vor.nb_samples = in_sampling.value
        vor.run(rg_nb_seeds.value,true)//clear = true
    })

    $(toggle_seeds).change((e)=>{
        vor.view_seeds(toggle_seeds.checked)
        vor.run(rg_nb_seeds.value)
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

