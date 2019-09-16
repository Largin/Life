// Main file
function init() {
	console.log("init - creating canvas");

	let canvas = document.createElement("canvas");
	canvas.width = document.body.offsetWidth;
	canvas.height = document.body.offsetHeight;
	canvas.setAttribute("id", "canvas");

	document.body.appendChild(canvas);
}

init();

let voronoi = new Voronoi();
let diagram = null;
let border_box = {x1: 1, y1: 1, x2: 799, y2: 399};
let points = randomPoints(100);
createSites();
drawBorder();
drawPoints(points);
drawDiagram();


function randomPoints (number) {
	let points = [];
	for (let i = 0; i<number; i++) {
		points.push({
			x: Math.round((border_box.x1+1 + Math.random() * (border_box.x2-2))*10)/10, 
			y: Math.round((border_box.y1+1 + Math.random() * (border_box.y2-2))*10)/10, 
		})
	}
	console.log(points);
	return points;
}

function createSites () {
	voronoi.recycle(diagram);
	diagram = voronoi.compute(points, border_box);
}

function drawPoints (points) {
	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");
	ctx.fillStyle = "#FF0000";
	for(let point of points) {
		ctx.fillRect(point.x-1, point.y-1, 2, 2); 
	}
}

function drawBorder () {
	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");

	ctx.beginPath();
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'white';
	ctx.fill();
	ctx.strokeStyle = '#888';
	ctx.stroke();	
}

function drawDiagram() {
	let canvas = document.getElementById("canvas");
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

}