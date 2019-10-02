'use strict';

(function(){
	console.log('init');
	let canvas = null;

	let Point = class {
		constructor(x, y) {
			this.x = x;
			this.y = y;
		}

		distance(point) {
			if(!(point instanceof Point)) throw 'Instance of Point class required.';
			let a = this.x - point.x;
			let b = this.y - point.y;
			return Math.sqrt(a*a + b*b);
		}
	};

	let Creature = class {
		constructor(point) {
			if(!(point instanceof Point)) throw 'Instance of Point class required.';
			this.position = point;
			this.goal = null;
		}

		decideWhatNow(scene) {
			// search closest plant in view
			this.checkGoal(scene);

			this.searchFood(scene);
		}

		searchFood(scene) {
			let closest = null;
			for(let p of scene.plants) {
				if(p.position.distance(this.position) > 100) continue;
				if(closest === null || p.position.distance(this.position) < closest.position.distance(this.position))
					closest = p;
			}
			this.goal = closest;
		}

		checkGoal(scene) {
			if(this.goal instanceof Plant) {
				if(!scene.plants.includes(this.goal))
					this.goal = null;
			}
		}
	};

	let Plant = class {
		constructor(point) {
			if(!(point instanceof Point)) throw 'Instance of Point class required.';
			this.position = point;
		}
	};

	let Scene = class {
		constructor() {
			this.creatures = [];
			this.plants = [];

			this.generatePlants(15);
			this.generateCreatures(8)
		}

		generatePlants(num) {
			for (let i = 0; i < num; i++) {
				let x = Math.round(Math.random() * 940) + 30;
				let y = Math.round(Math.random() * 540) + 30;
				this.plants.push(new Plant(new Point(x, y)));
			}
		}

		generateCreatures(num) {
			for (let i = 0; i < num; i++) {
				let z = Math.round(Math.random() * 4);
				let x, y;
				if(z == 0) {
					x = Math.round(Math.random() * 990) + 5;
					y = Math.round(Math.random() * 15) + 5;					
				}
				if(z == 1) {
					x = Math.round(Math.random() * 990) + 5;
					y = Math.round(Math.random() * 15) + 580;	
				}
				if(z == 2) {
					x = Math.round(Math.random() * 15) + 5;
					y = Math.round(Math.random() * 595) + 5;					
				}
				if(z == 3) {
					x = Math.round(Math.random() * 15) + 980;
					y = Math.round(Math.random() * 595) + 5;					
				}

				let p = new Point(x, y);
				let err = false;				

				for(let c of this.creatures) {
					if(p.distance(c.position) < 20) {
						error = true;
						break;
					}
				}

				if(error) {
					num ++;
					continue;
				}

				this.creatures.push(new Creature(p));
			}
		}
	}

	let Drawer = class {
		constructor() {
			console.log("creating canvas");
			this.canvas = document.createElement("canvas");
			this.canvas.height = 600;
			this.canvas.width = 1000;
			document.body.appendChild(this.canvas);		
			this.ctx = this.canvas.getContext('2d');			
		}

		clearCanvas() {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}

		drawScene(scene) {
			if(!(scene instanceof Scene)) throw 'Instance of Scene class required.';	
			console.log(scene);
			for(let c of scene.creatures) this.drawCreature(c);
			for(let p of scene.plants) this.drawPlant(p);		
		}

		drawCreature(creature) {
			if(!(creature instanceof Creature)) throw 'Instance of Creature class required.';
			let x = creature.position.x;
			let y = creature.position.y;
			this.ctx.beginPath();			
			this.ctx.arc(x+5, y+5, 10, 0, Math.PI * 2);
			this.ctx.moveTo(x+4, y+2);
			this.ctx.arc(x+2, y+2, 2, 0, Math.PI * 2);
			this.ctx.moveTo(x+10, y+2);
			this.ctx.arc(x+8, y+2, 2, 0, Math.PI * 2);
			this.ctx.stroke(); 

			this.drawCreatureSmile(creature);
			this.drawCreatureFoV(creature);	
			this.drawCreatureGoal(creature);
		}

		drawCreatureSmile(creature) {
			let x = creature.position.x;
			let y = creature.position.y;			
			this.ctx.beginPath();			
			this.ctx.arc(x+5, y+5, 7, Math.PI/4, Math.PI*3/4, false);	
			this.ctx.stroke(); 				
		}

		drawCreatureFoV(creature) {
			let x = creature.position.x;
			let y = creature.position.y;			
			this.ctx.setLineDash([1, 4]);
			this.ctx.beginPath();
			this.ctx.arc(x+5, y+5, 100, 0, Math.PI * 2);
			this.ctx.stroke();	
			this.ctx.setLineDash([]);				
		}

		drawCreatureGoal(creature) {
			if(creature.goal !== null) {
				this.ctx.setLineDash([3, 2]);
				this.ctx.beginPath();
				this.ctx.moveTo(creature.position.x, creature.position.y);
				this.ctx.lineTo(goal.position.x, goal.position.y);
				this.ctx.stroke();
			}			
		}

		drawPlant(plant) {
			if(!(plant instanceof Plant)) throw 'Instance of Plant class required.';
			let x = plant.position.x;
			let y = plant.position.y;			
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
		}		
	};

	let drawer = new Drawer;
	let scene = new Scene;

	drawer.drawScene(scene);
	return 1;	
})()
