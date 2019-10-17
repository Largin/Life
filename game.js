'use strict';

(function(){
	console.log('init');
	let canvas = null;

	let Point = class {
		constructor(x, y) {
			if(isNaN(x) || isNaN(y)) throw 'Numbers required.';
			this.x = x;
			this.y = y;
		}

		copy() {
			return new Point(this.x, this.y);
		}

		distance(point) {
			if(!(point instanceof Point)) throw 'Instance of Point class required.';
			let a = this.x - point.x;
			let b = this.y - point.y;
			return Math.sqrt(a*a + b*b);
		}

		plus(point) {
			if(!(point instanceof Point)) throw 'Instance of Point class required.';
			this.x += point.x;
			this.y += point.y;
			return this;
		}

		minus(point) {
			if(!(point instanceof Point)) throw 'Instance of Point class required.';
			this.x -= point.x;
			this.y -= point.y;
			return this;
		}

		multi(n) {
			if(isNaN(n)) throw 'Number required.';
			this.x *= n;
			this.y *= n;
			return this;
		}

		div(n) {
			if(isNaN(n)) throw 'Number required.';
			if(n == 0) throw 'Cannot divide by 0';
			this.x = this.x / n;
			this.y = this.y / n;
			return this;
		}

		normalize() {
			let d = Math.sqrt(this.x * this.x + this.y * this.y);
			if(d == 0) return this;
			return this.div(d);
		}
	};

	let Creature = class {
		constructor(point) {
			if(!(point instanceof Point)) throw 'Instance of Point class required.';
			this.position = point;
			this.goal = null;
			this.speed = 1;
			this.fov = 100;
			this.hunger = 2;
			this.fatigue = 500;
			this.home = point;
		}

		decideWhatNow(scene) {
			// search closest plant in view
			this.checkGoal(scene);
			if(this.hunger == 0)
				this.rest();
			else if(this.fatigue == 0)
				this.rest();
			else if(this.goal === null) {
				let g = this.searchFood(scene);
				if(g !== null)
					this.goal = g;
				else
					this.wander(scene);
			} else {
				if(this.goal instanceof Plant) {
					if(this.position.distance(this.goal.position) < 10)	{
						this.eatFood(scene);
					} else {
						this.goTowardGoal();
					}
				} else if(this.goal instanceof Place) {
					if(this.position.distance(this.goal.position) < 10)	{
						this.goal = null;
					} else {
						let g = this.searchFood(scene);
						if(g !== null)
							this.goal = g;
						else
							this.goTowardGoal();
					}
				}
			}
		}

		searchFood(scene) {
			let closest = null;
			for(let p of scene.plants) {
				if(p.position.distance(this.position) > this.fov) continue;
				if(closest === null || p.position.distance(this.position) < closest.position.distance(this.position))
					closest = p;
			}
			return closest;
		}

		eatFood(scene) {
			if(!(this.goal instanceof Plant)) return;
			if(this.position.distance(this.goal.position) <= 10) {
				let idx = scene.plants.indexOf(this.goal);
				scene.plants.splice(idx, 1);
				this.goal = null;
				this.hunger --;
			}
		}

		checkGoal(scene) {
			if(this.goal === null) return;
			if(this.goal instanceof Plant) {
				if(!scene.plants.includes(this.goal))
					this.goal = null;
			}
		}

		wander(scene) {
			let x = Math.round(Math.random() * 940) + 30;
			let y = Math.round(Math.random() * 540) + 30;
			this.goal = new Place(new Point(x,y));
		}

		goTowardGoal() {
			if(this.goal === null) return;
			let v = this.goal.position.copy().minus(this.position).normalize().multi(this.speed);
			this.position.plus(v);
			this.fatigue = Math.max(0, this.fatigue - this.speed);
		}

		rest() {
			this.fatigue = Math.min(500, this.fatigue + 2);
		}
	};

	let Plant = class {
		constructor(point) {
			if(!(point instanceof Point)) throw 'Instance of Point class required.';
			this.position = point;
			this.fruits = [];

			this.fruits.push(new Fruit(50));
			this.fruits.push(new Fruit(50));
		}

		growFruits(scene) {
			if(this.fruits.length < 4 && Math.random() > this.fruits.length * 0.2)
				this.fruits.push(new Fruit());
			for(let f of this.fruits) {
				f.ripeness += Math.floor(4 / this.fruits.length);
				if(f.ripeness > 500 && f.ripeness > 1000 - this.fruits.length * 100 * Math.random()) {
					f.position = this.position;
					scene.fruits.push(f);
				}
			}
		}
	};

	let Fruit = class {
		constructor(r = 0) {
			this.ripeness = r;
			this.foulness = 0;
			this.position = null;
		}
	};

	let Scene = class {
		constructor() {
			this.creatures = [];
			this.plants = [];
			this.fruits = [];

			this.generatePlants(20);
			//this.generateCreatures(10)
		}

		generatePlants(num) {
			do {
				let x = Math.round(Math.random() * 940) + 30;
				let y = Math.round(Math.random() * 540) + 30;
				let point = new Point(x, y);
				let error = false;

				for(let p of this.plants) {
					if(point.distance(p.position) < 15) {
						error = true;
						break;
					}
				}

				if(error) {
					num++;
				} else {
					this.plants.push(new Plant(point));
				}
			} while(--num);
		}

		generateCreatures(num) {
			do {
				let z = Math.floor(Math.random() * 4);
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
				let error = false;

				for(let c of this.creatures) {
					if(p.distance(c.position) < 20) {
						error = true;
						break;
					}
				}

				if(error) {
					num++;
				} else {
					this.creatures.push(new Creature(p));
				}
			} while(--num);
		}

		doTick() {
			for(let c of this.creatures) {
				c.decideWhatNow(this);
			}
			for(let p of this.plants) {

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
			this.ctx.arc(x, y, 10, 0, Math.PI * 2);
			this.ctx.moveTo(x+5, y-2);
			this.ctx.arc(x+3, y-2, 2, 0, Math.PI * 2);
			this.ctx.moveTo(x-1, y-2);
			this.ctx.arc(x-3, y-2, 2, 0, Math.PI * 2);
			this.ctx.stroke();

			this.drawCreatureSmile(creature);
			this.drawCreatureFoV(creature);
			this.drawCreatureGoal(creature);
			this.drawCreatureStats(creature);
		}

		drawCreatureSmile(creature) {
			let x = creature.position.x;
			let y = creature.position.y;
			this.ctx.beginPath();
			this.ctx.arc(x, y, 7, Math.PI/4, Math.PI*3/4, false);
			this.ctx.stroke();
		}

		drawCreatureFoV(creature) {
			let x = creature.position.x;
			let y = creature.position.y;
			this.ctx.setLineDash([1, 4]);
			this.ctx.beginPath();
			this.ctx.arc(x+5, y+5, creature.fov, 0, Math.PI * 2);
			this.ctx.stroke();
			this.ctx.setLineDash([]);
		}

		drawCreatureGoal(creature) {
			if(creature.goal !== null) {
				this.ctx.setLineDash([3, 2]);
				this.ctx.beginPath();
				this.ctx.moveTo(creature.position.x, creature.position.y);
				this.ctx.lineTo(creature.goal.position.x, creature.goal.position.y);
				this.ctx.stroke();
				this.ctx.setLineDash([]);
			}
		}

		drawCreatureStats(creature) {
			this.ctx.beginPath();
			this.ctx.moveTo(creature.position.x -10, creature.position.y - 12);
			this.ctx.lineTo(creature.position.x -10 + 20 * creature.hunger / 2, creature.position.y - 12);
			this.ctx.stroke();
			this.ctx.beginPath();
			this.ctx.moveTo(creature.position.x -10, creature.position.y - 14);
			this.ctx.lineTo(creature.position.x -10 + 20 * creature.fatigue / 500, creature.position.y - 14);
			this.ctx.stroke();
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

			if(plant.fruits.length > 0) {
				this.ctx.beginPath();
				this.ctx.arc(x+11, y-9, 2, 0, Math.PI * 2);
				this.ctx.stroke();
			}
			if(plant.fruits.length > 1) {
				this.ctx.beginPath();
				this.ctx.arc(x-5, y-11, 2, 0, Math.PI * 2);
				this.ctx.stroke();
			}
			if(plant.fruits.length > 2) {
				this.ctx.beginPath();
				this.ctx.arc(x+8, y-11, 2, 0, Math.PI * 2);
				this.ctx.stroke();
			}
			if(plant.fruits.length > 3) {
				this.ctx.beginPath();
				this.ctx.arc(x-9, y-9, 2, 0, Math.PI * 2);
				this.ctx.stroke();
			}
		}
	};

	let drawer = new Drawer;
	let scene = new Scene;

	let start = null;

	function step(timestamp) {
		if(!start) start = timestamp;
		let progress = timestamp - start;
		drawer.clearCanvas();
		scene.doTick();
		drawer.drawScene(scene);
		console.info(scene);
		if(progress < 10000)
			requestAnimationFrame(step);
	}

	requestAnimationFrame(step);

	return 1;
})()
