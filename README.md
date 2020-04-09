# voronoi
Parametric Voronoi generator with real time editing and SVG export

# Live demo
https://websvg.github.io/voronoi/

# Features
* Generate Voronoi
* Export Vornoi to SVG
* Edit seeds : add, move, remove
* Export and import seeds (drag and drop seeds.json) and continue editing of an existing seeds set
* bezier cells (quadratic curves)
* Parametric Seeds generation
  * Controlled seeds spread regularity with multiple sampling and keeping best candidate (farthest from neighbors)
  * Optionally include distance from walls to the sampling selection cost
* Range slider with interactive update for adding and removing seeds to and out of existing set
* Show/hide (cells, edges, seeds) and independently configure the SVG export
* Browser local storage of config parameters (Not SVG, not seeds as they can be saved separately)

# Planned features
* Shaped tesslation area
* geometric cells with variable size and filet effect
* bezier cells option
  * variable cell edges thickness (cell edge move to center)
  * variable bezier curve (cubic bezier curve with variable control points length)
* optionally remove pointy edges of bezier cells (ignore short edges)
* edit seed weight

## Known Issues
* min edge removal does not curve with the rest
* tesslation size does not cover the full height
* edit checkboxes not persisted

# License
MIT

# Dependencies

## Vornoi js Library

* 'gorhill' Javascript Voronoi library
  * [github repo](https://github.com/gorhill/Javascript-Voronoi)
  * [live demo](http://www.raymondhill.net/voronoi/rhill-voronoi.html)
  * used `rhill-voronoi-core.js` from commit 3fe2165

## bootstrap
* https://getbootstrap.com/docs/4.4/getting-started/introduction/
* https://gitbrent.github.io/bootstrap4-toggle/
* issue with bootstrap toggle adding event listeners with js not possible

## Export / Download
* Filesaver

```
  npm install file-saver --save
  file-saver@2.0.2
```
* to be replaced with 'a' download attribute : https://www.w3schools.com/tags/att_a_download.asp

# Vornoi js Reference

* 'stg' voronoi SVG vectorisation : 
  * also baed on [gorhill](https://github.com/gorhill/Javascript-Voronoi)'s library
  * [github stg repo](https://github.com/stg/SVoronoiG)
  * [forked added live demo](https://websvg.github.io/svg_voronoi_gen/)
* http://alexbeutel.com/webgl/voronoi.html
* http://cfbrasz.github.io/VoronoiColoring.html
* https://www.jasondavies.com/maps/voronoi/
