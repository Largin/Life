// Main file

function init() {
	console.log("init - creating canvas");

	let canvas = document.createElement("canvas");
	canvas.width = 800;// document.body.offsetWidth;
	canvas.height = 600;//document.body.offsetHeight;
	canvas.setAttribute("id", "canvas");

	document.body.appendChild(canvas);

	let canvas2 = document.createElement("canvas");
	canvas2.width = 800;// document.body.offsetWidth;
	canvas2.height = 600;//document.body.offsetHeight;
	canvas2.setAttribute("id", "canvas2");

	document.body.appendChild(canvas2);	

	let canvas3 = document.createElement("canvas");
	canvas3.width = 800;// document.body.offsetWidth;
	canvas3.height = 600;//document.body.offsetHeight;
	canvas3.setAttribute("id", "canvas3");

	document.body.appendChild(canvas3);		

	let canvas4 = document.createElement("canvas");
	canvas4.width = 800;// document.body.offsetWidth;
	canvas4.height = 600;//document.body.offsetHeight;
	canvas4.setAttribute("id", "canvas4");

	document.body.appendChild(canvas4);		

	let canvas5 = document.createElement("canvas");
	canvas5.width = 800;// document.body.offsetWidth;
	canvas5.height = 600;//document.body.offsetHeight;
	canvas5.setAttribute("id", "canvas5");

	document.body.appendChild(canvas5);	

	let canvas6 = document.createElement("canvas");
	canvas6.width = 800;// document.body.offsetWidth;
	canvas6.height = 600;//document.body.offsetHeight;
	canvas6.setAttribute("id", "canvas6");

	document.body.appendChild(canvas6);		
}

init();

let voronoi = new Voronoi();
let diagram = null;
let border_box = {xl: 0, yt: 0, xr: 800, yb: 600};
let points = randomPoints(100);
createSites();
drawBorder();
drawPoints(points);
drawDiagram();


function randomPoints (number) {
	let points = [];
	for (let i = 0; i<number; i++) {
		points.push({
			x: Math.round((border_box.xl+0.1 + Math.random() * (border_box.xr-0.2))*10)/10, 
			y: Math.round((border_box.yt+0.1 + Math.random() * (border_box.yb-0.2))*10)/10, 
		})
	}
	console.log(points);
	return points;
}

function createSites () {
	voronoi.recycle(diagram);
	diagram = voronoi.compute(points, border_box);
}

function cellCentroid(cell) {
	var x = 0, y = 0,
		halfedges = cell.halfedges,
		iHalfedge = halfedges.length,
		halfedge,
		v, p1, p2;
	while (iHalfedge--) {
		halfedge = halfedges[iHalfedge];
		p1 = halfedge.getStartpoint();
		p2 = halfedge.getEndpoint();
		v = p1.x*p2.y - p2.x*p1.y;
		x += (p1.x+p2.x) * v;
		y += (p1.y+p2.y) * v;
		}
	v = cellArea(cell) * 6;
	return {x:x/v,y:y/v};	
}

function cellArea(cell) {
	var area = 0,
		halfedges = cell.halfedges,
		iHalfedge = halfedges.length,
		halfedge,
		p1, p2;
	while (iHalfedge--) {
		halfedge = halfedges[iHalfedge];
		p1 = halfedge.getStartpoint();
		p2 = halfedge.getEndpoint();
		area += p1.x * p2.y;
		area -= p1.y * p2.x;
		}
	area /= 2;
	return area;	
}

function drawPoints (points) {
	let canvas = document.getElementById("canvas2");
	let ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FF0000";
	for(let point of points) {
		ctx.fillRect(point.x-1, point.y-1, 2, 2); 
	}
}

function drawBorder () {
	let canvas = document.getElementById("canvas2");
	let ctx = canvas.getContext("2d");

	ctx.beginPath();
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'white';
	ctx.fill();
	ctx.strokeStyle = '#888';
	ctx.stroke();	
}

function drawDiagram() {
	let canvas = document.getElementById("canvas2");
	let ctx = canvas.getContext("2d");

	if (!diagram) {return;}
	ctx.beginPath();
	ctx.strokeStyle = '#000';

	let edges = diagram.edges;
	let iEdge = edges.length;

	while (iEdge--) {
		let edge = edges[iEdge];
		let v = edge.va;
		ctx.moveTo(v.x,v.y);
		v = edge.vb;
		ctx.lineTo(v.x,v.y);		
	}
	ctx.stroke();

	let cells = diagram.cells;
	let iCells = cells.length;
	let p = 1 / iCells * 0.1;

	while (iCells--) {
		let cell = cells[iCells];
		rn = Math.random();

		if(rn < p) continue;

		centroid = cellCentroid(cell);
		//diagram.cells[iCells].centroid = centroid;

		ctx.fillStyle = "#00FF00";
		ctx.fillRect(centroid.x-1, centroid.y-1, 2, 2); 	
	}
}


var VoronoiDemo = {
	voronoi: new Voronoi(),
	diagram: null,
	margin: 0.1,
	canvas: null,
	bbox: {xl:0,xr:800,yt:0,yb:600},
	sites: [],
	timeoutDelay: 300,
	init: function() {
		this.canvas = document.getElementById('canvas');
		this.randomSites(100,true);
		},
	clearSites: function() {
		this.compute([]);
		},
	randomSites: function(n, clear) {
		var sites = [];
		if (!clear) {
			sites = this.sites.slice(0);
			}
		// create vertices
		var xmargin = this.canvas.width*this.margin,
			ymargin = this.canvas.height*this.margin,
			xo = xmargin,
			dx = this.canvas.width-xmargin*2,
			yo = ymargin,
			dy = this.canvas.height-ymargin*2;
		for (var i=0; i<n; i++) {
			sites.push({x:self.Math.round((xo+self.Math.random()*dx)*10)/10,y:self.Math.round((yo+self.Math.random()*dy)*10)/10});
			}
		this.compute(sites);
		// relax sites
		if (this.timeout) {
			clearTimeout(this.timeout)
			this.timeout = null;
			}
		/*
		var me = this;
		this.timeout = setTimeout(function(){
			me.relaxSites();
			}, this.timeoutDelay);
		*/
		},
	relaxSites: function() {
		if (!this.diagram) {return;}
		var cells = this.diagram.cells,
			iCell = cells.length,
			cell,
			site, sites = [],
			again = false,
			rn, dist;
		var p = 1 / iCell * 0.1;
		while (iCell--) {
			cell = cells[iCell];
			rn = Math.random();
			// probability of apoptosis
			if (rn < p) {
				continue;
				}
			site = this.cellCentroid(cell);
			dist = this.distance(site, cell.site);
			again = again || dist > 3;
			// don't relax too fast
			if (dist > 2) {
				site.x = (site.x+cell.site.x)/2;
				site.y = (site.y+cell.site.y)/2;
				}
			// probability of mytosis
			if (rn > (1-p)) {
				dist /= 2;
				sites.push({
					x: site.x+(site.x-cell.site.x)/dist,
					y: site.y+(site.y-cell.site.y)/dist,
					});
				}
			sites.push(site);
			}
		this.compute(sites);
		if (again) {
			var me = this;
			this.timeout = setTimeout(function(){
				me.relaxSites();
				}, this.timeoutDelay);
			}
		},
	distance: function(a, b) {
		var dx = a.x-b.x,
			dy = a.y-b.y;
		return Math.sqrt(dx*dx+dy*dy);
		},
	cellArea: function(cell) {
		var area = 0,
			halfedges = cell.halfedges,
			iHalfedge = halfedges.length,
			halfedge,
			p1, p2;
		while (iHalfedge--) {
			halfedge = halfedges[iHalfedge];
			p1 = halfedge.getStartpoint();
			p2 = halfedge.getEndpoint();
			area += p1.x * p2.y;
			area -= p1.y * p2.x;
			}
		area /= 2;
		return area;
		},
	cellCentroid: function(cell) {
		var x = 0, y = 0,
			halfedges = cell.halfedges,
			iHalfedge = halfedges.length,
			halfedge,
			v, p1, p2;
		while (iHalfedge--) {
			halfedge = halfedges[iHalfedge];
			p1 = halfedge.getStartpoint();
			p2 = halfedge.getEndpoint();
			v = p1.x*p2.y - p2.x*p1.y;
			x += (p1.x+p2.x) * v;
			y += (p1.y+p2.y) * v;
			}
		v = this.cellArea(cell) * 6;
		return {x:x/v,y:y/v};
		},
	compute: function(sites) {
		this.sites = sites;
		this.voronoi.recycle(this.diagram);
		this.diagram = this.voronoi.compute(sites, this.bbox);
		this.updateStats();
		this.render();
		},
	updateStats: function() {
		if (!this.diagram) {return;}
		var e = document.getElementById('voronoiStats');
		if (!e) {return;}
		e.innerHTML = '('+this.diagram.cells.length+' Voronoi cells computed from '+this.diagram.cells.length+' Voronoi sites in '+this.diagram.execTime+' ms &ndash; rendering <i>not</i> included)';
		},
	render: function() {
		var ctx = this.canvas.getContext('2d');
		// background
		ctx.globalAlpha = 1;
		ctx.beginPath();
		ctx.rect(0,0,this.canvas.width,this.canvas.height);
		ctx.fillStyle = 'white';
		ctx.fill();
		ctx.strokeStyle = '#888';
		ctx.stroke();
		// voronoi
		if (!this.diagram) {return;}
		// edges
		ctx.beginPath();
		ctx.strokeStyle = '#000';
		var edges = this.diagram.edges,
			iEdge = edges.length,
			edge, v;
		while (iEdge--) {
			edge = edges[iEdge];
			v = edge.va;
			ctx.moveTo(v.x,v.y);
			v = edge.vb;
			ctx.lineTo(v.x,v.y);
			}
		ctx.stroke();
		// sites
		ctx.beginPath();
		ctx.fillStyle = '#44f';
		var sites = this.sites,
			iSite = sites.length;
		while (iSite--) {
			v = sites[iSite];
			ctx.rect(v.x-2/3,v.y-2/3,2,2);
			}
		ctx.fill();
		},
	};

VoronoiDemo.init();


// Gradient
function drawGradient() {
	let canvas = document.getElementById("canvas3");
	let ctx = canvas.getContext("2d");	
	let center = {x:400, y:300};

	for (let x = border_box.xl; x < border_box.xr; x = x + 3) {
		for (let y = border_box.yt; y < border_box.yb; y = y + 3) {
			let dist = Math.sqrt((center.x - x)*(center.x - x)+(center.y - y)*(center.y - y));
			let f = (500 - dist) / 500;
			let shade = Math.round(f * 255);
			ctx.fillStyle = 'rgb('+shade+', '+shade+', '+shade+')';
			ctx.fillRect(x-1, y-1, 2, 2); 
		}
	}
}

drawGradient();

function drawSimple() {
	let canvas = document.getElementById("canvas4");
	let ctx = canvas.getContext("2d");	

	noise.seed('test');

	for (let x = border_box.xl; x < border_box.xr; x = x + 3) {
		for (let y = border_box.yt; y < border_box.yb; y = y + 3) {
			let s = noise.simplex2(x/100,y/100);
			let shade = 128 + Math.round(127 * s);
			ctx.fillStyle = 'rgb('+shade+', '+shade+', '+shade+')';
			ctx.fillRect(x-1, y-1, 2, 2); 
		}
	}
}

drawSimple();

function drawPerlin() {
	let canvas = document.getElementById("canvas5");
	let ctx = canvas.getContext("2d");	

	noise.seed('test');

	for (let x = border_box.xl; x < border_box.xr; x = x + 3) {
		for (let y = border_box.yt; y < border_box.yb; y = y + 3) {
			let s = noise.perlin2(x/75,y/75);
			let shade = 128 + Math.round(127 * s);
			ctx.fillStyle = 'rgb('+shade+', '+shade+', '+shade+')';
			ctx.fillRect(x-1, y-1, 2, 2); 
		}
	}
}

drawPerlin();


function drawPerlinGradient() {
	let canvas = document.getElementById("canvas6");
	let ctx = canvas.getContext("2d");	
	let center = {x:400, y:300};

	noise.seed('test');

	for (let x = border_box.xl; x < border_box.xr; x = x + 3) {
		for (let y = border_box.yt; y < border_box.yb; y = y + 3) {
			let dist = Math.sqrt((center.x - x)*(center.x - x)+(center.y - y)*(center.y - y));
			let s = noise.perlin2(x/70,y/70);
			let f = (400 - dist) / 400;
			let shade = Math.round(f * (s + 1)/2 * 255);
			shade = Math.round(f*127 + s*64 + 64);
			if(shade < 128)
				ctx.fillStyle  = 'rgb(0, 0, '+shade+')';
			else
				ctx.fillStyle = 'rgb('+shade+', '+shade+', '+shade+')';
			ctx.fillRect(x-1, y-1, 2, 2); 
		}
	}
}

drawPerlinGradient();