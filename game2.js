import {Drawer, World} from './drawer.js'

let drawer = new Drawer();

let w = new World();
w.spawnRandomFruits(50);
w.spawnRandomHome();
w.spawnRandomHome();
w.spawnCreaturesAtHomes(5);

drawer.drawWorld(w);

function step() {
	w.doTick();
	w.doTick();
	w.doTick();
	w.doTick();
	w.doTick();
	drawer.clearCanvas();
	drawer.drawWorld(w);
	if(w.day < w.dayLimit)
		requestAnimationFrame(step);
}

requestAnimationFrame(step);
