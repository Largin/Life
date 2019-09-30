'use strict';

(function(){
	console.log('init');
	let canvas = null;

	let drawer = {
		canvas: null,
		ctx: null,

		createCanvas: function() {
			console.log("creating canvas");
			this.canvas = document.createElement("canvas");
			this.canvas.height = 600;
			this.canvas.width = 1000;
			document.body.appendChild(this.canvas);		
			this.ctx = this.canvas.getContext('2d');
		},

		clearCanvas: function() {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		},

		drawCreature: function(x, y) {
			this.ctx.beginPath();
			this.ctx.arc(x+5, y+5, 7, Math.PI/4, Math.PI*3/4, false);
			this.ctx.moveTo(x+15,y+5);
			this.ctx.arc(x+5, y+5, 10, 0, Math.PI * 2);
			this.ctx.moveTo(x+4, y+2);
			this.ctx.arc(x+2, y+2, 2, 0, Math.PI * 2);
			this.ctx.moveTo(x+10, y+2);
			this.ctx.arc(x+8, y+2, 2, 0, Math.PI * 2);
			this.ctx.stroke(); 
		},

		drawPlant: function(x,y) {
			this.ctx.beginPath();
			this.ctx.moveTo(x, y+10);
			this.ctx.lineTo(x, y);
			this.ctx.lineTo(x+5, y-5);
			this.ctx.lineTo(x+10, y-8);
			this.ctx.moveTo(x+5, y-5);
			this.ctx.lineTo(x+7, y-10);
			this.ctx.moveTo(x,y);
			this.ctx.lineTo(x-3,y-5);
			this.ctx.lineTo(x-4,y-10);
			this.ctx.moveTo(x-3,y-5);
			this.ctx.lineTo(x-8,y-8);
			this.ctx.stroke();
		},
	}

	drawer.createCanvas();
	drawer.drawCreature(150, 150);
	drawer.drawPlant(200,200);

	return 1;	
})()
