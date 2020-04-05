# voronoi
Parametric Voronoi generator with real time editing and SVG export

# Live demo
https://websvg.github.io/voronoi/

# Features
* Generate Voronoi
* Export Vornoi to SVG
* Edit seeds : add, move, remove
* Export and import seeds (drag and drop seeds.json) and continue editing of an existing seeds set
* Parametric Seeds generation
  * Controlled seeds spread regularity with multiple sampling and keeping best candidate (farthest from neighbors)
  * Optionally include distance from walls to the sampling selection cost
* Range slider with interactive update for adding and removing seeds to and out of existing set
* Show/hide seeds, and independently include/exclude seeds in/out of SVG export

# Planned features
* Shaped tesslation area
* bezier cells option
  * variable cell edges thickness
  * variable bezier curve
* edit seed weight

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
* 