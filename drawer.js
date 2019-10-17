class Point {
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
		if(this.x == point.x)
			return Math.abs(this.y - point.y)
		if(this.y == point.y)
			return Math.abs(this.x - point.x)

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

	static polar(fi, r) {
		let x = Math.round(r * Math.cos(fi));
		let y = Math.round(r * Math.sin(fi));
		return new Point(x,y);
	}
};

class Fruit {
	constructor(point){
		if(!(point instanceof Point)) throw 'Instance of Point class required.';
		this.position = point;
		this.calories = 50;
	}

	bite(b = 10) {
		let fb = Math.min(this.calories, b);
		this.calories -= fb;
		return fb;
	}
}

class Position {
	constructor(point){
		if(!(point instanceof Point)) throw 'Instance of Point class required.';
		this.position = point;
	}
}

class Creature {
	constructor(point, home = null){
		if(!(point instanceof Point)) throw 'Instance of Point class required.';
		this.position = point;
		this.home = home;
		this.goal = null;
		this.age = 0;

		this.fov = 70;
		this.hunger = 100;
		this.fatigue = 1000;
		this.speed = 1;
		this.carrying = [];

		this.DNA = {
			sex: (Math.random() > 0.5 ? 'F' : 'M'),
			dropFruitAtHome: 0.5,
		};
	}

	isAtHome(world) {
		if(this.home !== null)
			return this.position.distance(this.home.position) < this.home.size;
		return this.position.x <= world.box.margin || this.position.x >= (world.box.rx - world.box.margin) || this.position.y <= world.box.margin || this.position.y >= (world.box.by - world.box.margin);
	}

	findHome(world) {
		if(this.home !== null)
			return this.home;
		let lHome = new Point(world.box.margin, this.position.y);
		let rHome = new Point((world.box.rx - world.box.margin), this.position.y);
		let tHome = new Point(this.position.x, world.box.margin);
		let bHome = new Point(this.position.x, (world.box.by - world.box.margin));

		let lDist =  this.position.distance(lHome);
		let rDist =  this.position.distance(rHome);
		let tDist =  this.position.distance(tHome);
		let bDist =  this.position.distance(bHome);

		let closest = lHome;
		let closestDist = lDist;
		if(rDist < closestDist) {
			closest = rHome;
			closestDist = rDist;
		}
		if(tDist < closestDist) {
			closest = tHome;
			closestDist = tDist;
		}
		if(bDist < closestDist) {
			closest = bHome;
			closestDist = bDist;
		}
		return new Position(closest);
	}

	findHomeDistance(world) {
		if(this.home !== null)
			return (this.position.distance(this.home.position) - this.home.size) / this.speed;
		let home = this.findHome(world);
		return this.position.distance(home.position);
	}

	findFood(world) {
		let closest = null;
		for(let p of world.fruits) {
			if(p.position.distance(this.position) > this.fov) continue;
			if(closest === null || p.position.distance(this.position) < closest.position.distance(this.position))
				closest = p;
		}
		return closest;
	}

	pickFruit(world) {
		if(!(this.goal instanceof Fruit)) return;
		if(this.carrying.length == 2) return;
		if(this.position.distance(this.goal.position) < 5) {
			let idx = world.fruits.indexOf(this.goal);
			let f = world.fruits.splice(idx, 1);
			this.carrying.push(f.pop());
			this.goal = null;
		}
	}

	dropFruit(world) {
		if(this.carrying.length == 0) return;
		if(this.carrying[0] instanceof Fruit) {
			let f = this.carrying.shift();
			f.position = this.position.copy();
			world.fruits.push(f);
		} else if(this.carrying[1] instanceof Fruit) {
			let f = this.carrying.pop();
			f.position = this.position.copy();
			world.fruits.push(f);
		}
	}

	eatFruit() {
		if(this.carrying.length == 0) return;
		if(this.carrying[0] instanceof Fruit) {
			this.hunger -= this.carrying[0].bite();
		} else if(this.carrying[1] instanceof Fruit) {
			this.hunger -= this.carrying[1].bite();
		}
	}

	wanderForFood(world) {
		let x = Math.round(Math.random() * world.box.rx) + world.box.margin;
		let y = Math.round(Math.random() * world.box.by) + world.box.margin;
		return new Position(new Point(x,y));
	}

	goToGoal() {
		if(this.goal === null) return;
		let v = this.goal.position.copy().minus(this.position).normalize().multi(this.speed);
		this.position.plus(v);
		this.fatigue = Math.max(0, this.fatigue - this.speed);
	}

	checkGoal(world) {
		if(this.goal === null) return;
		if(this.goal instanceof Fruit) {
			if(!world.fruits.includes(this.goal))
				this.goal = null;
		}
	}

	tick(world) {
		this.checkGoal(world);
		if(this.fatigue == 0) {
			if(this.hunger <= 0) return true;
			if(this.carrying.length == 0) return true;
			if(this.hunger > 0 && this.carrying.length > 0) {
				this.eatFruit();
				return false;
			}
			return true;
		}
		if(this.hunger <= 0) {
			if(this.isAtHome()) {
				if(this.carrying.length > 0) {
					if(Math.random() > this.DNA.dropFruitAtHome)
						this.dropFruit();
				}
			}
		}




		if(this.hunger <= 0) {
			if(this.isAtHome(world))
				return true;
			if(this.goal == null)
				this.goal = this.findHome(world);
			this.goToGoal();
		}
		if(this.hunger < 50) {
			if(this.goal === null || this.goal instanceof Position)
				this.goal = this.findFood(world) || this.goal;
			if(this.goal === null)
				this.goal = this.wanderForFood(world);
			if(this.goal instanceof Fruit && this.position.distance(this.goal.position) < 5)
				this.pickFruit(world);
			if(this.goal instanceof Position && this.position.distance(this.goal.position) < 5)
				this.goal = this.wanderForFood(world);
			if(this.fatigue - this.findHomeDistance(world) < 5)
				this.goal = this.findHome(world);
			if(this.goal == this.home && this.isAtHome(world))
				return true;
			if(this.goal !== null)
				this.goToGoal();
		}
		if(this.hunger > 50) {
			if(this.goal === null || this.goal instanceof Position)
				this.goal = this.findFood(world) || this.goal;
			if(this.goal === null)
				this.goal = this.wanderForFood(world);
			if(this.goal instanceof Fruit && this.position.distance(this.goal.position) < 5)
				this.pickFruit(world);
			if(this.goal instanceof Position && this.position.distance(this.goal.position) < 5)
				this.goal = this.wanderForFood(world);
			if(this.goal !== null)
				this.goToGoal();
		}
		return false;
	}

	getOlder() {
		this.age++;
		this.speed -= this.age * 0.05;
		this.fatigue -= this.age * 50;
		this.speed = Math.round(this.speed * 100) / 100;
		this.fatigue = Math.round(this.fatigue * this.speed);
	}
}

class Home {
	constructor(point){
		if(!(point instanceof Point)) throw 'Instance of Point class required.';
		this.position = point;
		this.size = 50;
	}
}

export class World {
	constructor(){
		this.fruits = [];
		this.creatures = [];
		this.homes = [];

		this.fruitsNum = 50;
		this.dayTime = 0;
		this.dayLimit = 20;
		this.pause = 0;

		this.box = {lx: 0, rx: 1800, ty: 0, by: 800, margin: 20};
		this.day = 0;

		this.stats = {
			creatures: [],
		}
	}

	// homes
	spawnHome(point) {
		if(!(point instanceof Point)) throw 'Instance of Point class required.';
		this.homes.push(new Home(point));
	}

	spawnRandomHome() {
		let tooClose = false;
		let p;
		let limit = 10;
		do {
			let x = Math.round(Math.random() * (this.box.rx - this.box.lx - this.box.margin * 8)) + this.box.margin * 4;
			let y = Math.round(Math.random() * (this.box.by - this.box.ty - this.box.margin * 8)) + this.box.margin * 4;
			p = new Point(x, y);

			for(let h of this.homes)
				tooClose = tooClose || (h.position.distance(p) < 3 * h.size)
		} while(tooClose && limit-- > 0)
		if(limit <= 0) return;
		this.spawnHome(p);
	}

	// fruits
	spawnFruit(point) {
		if(!(point instanceof Point)) throw 'Instance of Point class required.';
		this.fruits.push(new Fruit(point));
	}

	spawnRandomFruit() {
		let x = Math.round(Math.random() * (this.box.rx - this.box.lx - this.box.margin * 2)) + this.box.margin;
		let y = Math.round(Math.random() * (this.box.by - this.box.ty - this.box.margin * 2)) + this.box.margin;
		this.spawnFruit(new Point(x, y));
	}

	spawnRandomFruits(num){
		while(num-- > 0)
			this.spawnRandomFruit();
	}

	// creatures
	spawnCreature(point) {
		if(!(point instanceof Point)) throw 'Instance of Point class required.';
		this.creatures.push(new Creature(point));
	}

	spawnCreatureAtHome(home) {
		if(!(home instanceof Home)) throw 'Instance of Home class required.';
		let r = home.size * Math.random();
		let fi = 2 * Math.PI * Math.random();
		this.creatures.push(new Creature(Point.polar(fi, r).plus(home.position), home));
	}

	spawnCreaturesAtHome(home, num) {
		while(num-- > 0)
			this.spawnCreatureAtHome(home);
	}

	spawnCreaturesAtHomes(num) {
		for(let h of this.homes)
			this.spawnCreaturesAtHome(h, num);
	}

	// mechanics
	resetDay() {
		this.stats.creatures.push(this.creatures.length);
		this.fruits = [];
		this.spawnRandomFruits(this.fruitsNum);
		for (let i = this.creatures.length - 1; i >= 0; i--) {
			if(this.creatures[i].hunger == 2) {
				this.creatures.splice(i, 1);
				continue;
			}
			if(!this.creatures[i].isAtHome(this)) {
				this.creatures.splice(i, 1);
				continue;
			}
			if(this.creatures[i].hunger <= 0) {
				if(this.creatures[i].home !== null) {
					this.spawnCreatureAtHome(this.creatures[i].home)
				} else {
					let p = new Point(Math.round(Math.random()*5), Math.round(Math.random()*5));
					p.plus(this.creatures[i].position);
					p.x = Math.min(1800, Math.max(0, p.x));
					p.y = Math.min(800, Math.max(0, p.y));
					this.spawnCreature(p);
				}
			}
			this.creatures[i].fatigue = 1000;
			this.creatures[i].hunger += 100;
			this.creatures[i].goal = null;
			this.creatures[i].getOlder();
			if(this.creatures[i].speed <= 0)
				this.creatures.splice(i, 1);
		}
		this.pause = 0;
		this.dayTime = 0;
		this.day ++;
		console.log(this.creatures[0]);
	}

	doTick() {
		let endTime = true

		for(let c of this.creatures){
			let ended = c.tick(this);
			endTime = endTime && ended;
		}

		this.dayTime++;

		if(endTime){
			this.pause ++;
		}
		if(this.pause > 500)
			this.resetDay();
	}
}

export class Drawer {
	constructor() {
		console.log("creating canvas");
		this.canvas = document.createElement("canvas");
		this.canvas.height = 800;
		this.canvas.width = 1800;
		document.body.appendChild(this.canvas);
		this.ctx = this.canvas.getContext('2d');
	}

	clearCanvas() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawHome(home){
		if(!(home instanceof Home)) throw 'Instance of Home class required.';
		this.ctx.beginPath();
		this.ctx.arc(home.position.x, home.position.y, home.size, 0, Math.PI * 2);
		this.ctx.stroke();
	}

	drawCreature(creature){
		if(!(creature instanceof Creature)) throw 'Instance of Creature class required.';
		this.ctx.beginPath();
		this.ctx.arc(creature.position.x, creature.position.y, 2, 0, Math.PI * 2);
		this.ctx.fill();
		this.ctx.stroke();
		this.drawCreatureFov(creature);
		this.drawCreatureStats(creature);
		this.drawCreatureGoal(creature);
	}

	drawCreatureFov(creature) {
		if(!(creature instanceof Creature)) throw 'Instance of Creature class required.';
		this.ctx.setLineDash([1, 6]);
		this.ctx.beginPath();
		this.ctx.arc(creature.position.x, creature.position.y, creature.fov, 0, Math.PI * 2);
		this.ctx.stroke();
		this.ctx.setLineDash([]);
	}

	drawCreatureStats(creature) {
		if(!(creature instanceof Creature)) throw 'Instance of Creature class required.';

		this.ctx.beginPath();
		this.ctx.moveTo(creature.position.x - 4, creature.position.y - 4);
		this.ctx.lineTo(creature.position.x - 4 + 8 * creature.hunger / 100, creature.position.y - 4);
		this.ctx.stroke();

		this.ctx.beginPath();
		this.ctx.moveTo(creature.position.x - 4, creature.position.y - 5);
		this.ctx.lineTo(creature.position.x - 4 + 8 * creature.fatigue / 1000, creature.position.y - 5);
		this.ctx.stroke();
	}

	drawCreatureGoal(creature) {
		if(!(creature instanceof Creature)) throw 'Instance of Creature class required.';
		if(creature.goal === null) return;
		this.ctx.setLineDash([2, 6]);
		this.ctx.beginPath();
		this.ctx.moveTo(creature.position.x, creature.position.y);
		this.ctx.lineTo(creature.goal.position.x, creature.goal.position.y);
		this.ctx.stroke();
		this.ctx.setLineDash([]);
	}

	drawFruit(fruit) {
		if(!(fruit instanceof Fruit)) throw 'Instance of Fruit class required.';
		this.ctx.beginPath();
		this.ctx.arc(fruit.position.x, fruit.position.y, 2, 0, Math.PI * 2);
		this.ctx.fill();
		this.ctx.stroke();
	}

	drawStats(stat) {
		this.ctx.beginPath();
		this.ctx.moveTo(5,5);
		this.ctx.lineTo(5,105);
		this.ctx.lineTo(5+5*stat.length, 105);
		this.ctx.stroke();

		if(stat.length > 0) {
			let max = Math.max(...stat);
			this.ctx.beginPath();
			this.ctx.moveTo(5,100);
			for (let i = 0; i < stat.length; i++) {
				this.ctx.lineTo(10+5*i, 105 - (100 * stat[i] / max));
			}
			this.ctx.stroke();

			this.ctx.fillText(max, 6, 12);
		}
	}

	drawWorld(world) {
		if(!(world instanceof World)) throw 'Instance of World class required.';
		this.ctx.strokeStyle = '#009900';
		this.ctx.fillStyle = '#009900';
		for(let f of world.fruits) {
			this.drawFruit(f);
		}
		this.ctx.strokeStyle = '#990000';
		this.ctx.fillStyle = '#990000';
		for(let c of world.creatures) {
			this.drawCreature(c);
		}
		this.ctx.strokeStyle = '#990099';
		for(let h of world.homes) {
			this.drawHome(h);
		}
		this.ctx.strokeStyle = '#000000';

		this.drawStats(world.stats.creatures);

		this.ctx.beginPath();
		this.ctx.moveTo(0,1);
		this.ctx.lineTo(this.canvas.width * world.day / world.dayLimit , 1);
		this.ctx.stroke();
	}
};
