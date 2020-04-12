# voronoi
Parametric Voronoi generator with real time editing and SVG export

# Live demo
https://websvg.github.io/voronoi/

# Gif Demo



# Features
* Generate Voronoi
* Export Vornoi to SVG
  ## seeds
* Edit seeds : add, move, remove
* Export and import seeds (drag and drop seeds.json) and continue editing of an existing seeds set
* Parametric Seeds generation
  * Controlled seeds spread regularity with multiple sampling and keeping best candidate (farthest from neighbors)
  * Optionally include distance from walls to the sampling selection cost
* Range slider with interactive update for adding and removing seeds to and out of existing set
  ## cells
* different cells types
  * bezier quadratic
  * bezier cubic
  * simple geometric edges
* cells edges retraction. Not cells scale but edges parallel ertraction with handling of edges discard
  ## gui
* Show/hide (cells, edges, seeds) and independently configure the SVG export
* Browser local storage of config parameters (Not SVG, not seeds as they can be saved separately)
* voronoi icon

# Planned features
* Shaped tesslation area
  * sampling points and check if point inside SVG with `document.elementFromPoint(x, y);`
* edeg cells filet effect
* optionally remove pointy edges of bezier cells (detract short edges only)
* edit seed weight (? requires a new engine)
* add irregularities to the edges thickness (randomize retraction)

## Known Issues
* cubic bezier export `./media/exp_2_cubic.svg` not supported by Fusion360, not clear if this is an SVG generation issue or Fusion360 limitation
* some seeds combination result in distorded edges on retraction

# Dev User Guide
## cells retraction
## Minimal cells edge size
<img src="./media/short_edges.gif" width=400>

* goal is to filter small edge to avoid ugly bezier edgy effect
* ignoring an edge poses the issue of which vertex to use as control point for the left edges
* using the center of the removed edge as new control point would break the tangency alignment with the previous curve
* clean way would require ignoring the corresponding site completely and extend the left edges till the small edge is nullified, thus reducing the total number of sides of the cell
* cell sides expansion only works for bezier cells not for geometric cell
* therefore, the min edge size filtering is currently disabled until proper small edges expansion is implemented

# License
MIT

# Dependencies

## Vornoi js Library

* 'gorhill' Javascript Voronoi library
  * [github repo](https://github.com/gorhill/Javascript-Voronoi)
  * [live demo](http://www.raymondhill.net/voronoi/rhill-voronoi.html)
  * used `rhill-voronoi-core.js` from commit 3fe2165

## Vector module from matter.js
* modified `./node_modules/matter-js/src/geometry/Vector.js` for ES2015 module import

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

# References

## js voronoi SVG
* 'stg' voronoi SVG vectorisation : 
  * also baed on [gorhill](https://github.com/gorhill/Javascript-Voronoi)'s library
  * [github stg repo](https://github.com/stg/SVoronoiG)
  * [forked added live demo](https://websvg.github.io/svg_voronoi_gen/)
* http://alexbeutel.com/webgl/voronoi.html
* http://cfbrasz.github.io/VoronoiColoring.html
* https://www.jasondavies.com/maps/voronoi/

## lines intersection
* [wikipedia - lines intersection](https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection)

<img src="./media/intersection_formula.svg">
