import { GameData } from "wasm-game-of-life";

// We create this here because it will be used from within `imports`
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");

let module = {};
const gamedata = GameData.new(1024.0, 600.0);

// Returns an object containing resources that will be used later for drawing
function resources() {
    let res = {
	player: document.createElement('canvas'),
	enemy: document.createElement('canvas'),
	bullet: document.createElement('canvas'),
	particle: document.createElement('canvas')
    }

    // Particle
    res.particle.width = 20;
    res.particle.height = 20;
    let pCtx = res.particle.getContext('2d');
    pCtx.fillStyle = "darkviolet";
    pCtx.beginPath();
    pCtx.arc(10, 10, 10, 0, 2 * Math.PI);
    pCtx.fill();

    // Bullet
    res.bullet.width = 6;
    res.bullet.height = 6;
    let bCtx = res.bullet.getContext('2d');
    bCtx.fillStyle = "blue";
    bCtx.beginPath();
    bCtx.arc(3, 3, 3, 0, 2 * Math.PI);
    bCtx.fill();

    // Enemy
    res.enemy.width = 20;
    res.enemy.height = 20;
    let eCtx = res.enemy.getContext('2d');
    eCtx.fillStyle = "yellow";
    eCtx.beginPath();
    eCtx.arc(10, 10, 10, 0, 2 * Math.PI);
    eCtx.fill();

    // Player
    res.player.width = 20;
    res.player.height = 16;
    let plCtx = res.player.getContext('2d');
    plCtx.fillStyle = "red";
    plCtx.beginPath();
    plCtx.lineTo(20, 8);
    plCtx.lineTo(0, 16);
    plCtx.lineTo(0, 0);
    plCtx.fill();

    return res;
}

// Returns an object containing functions that will be linked to our wasm model
// This means that they can be called from Rust
function imports() {
    const res = resources();

    function clear_screen() {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function draw_player(x, y, angle) {
	ctx.translate(x, y);
	ctx.rotate(angle);
	ctx.translate(0, -8);
	ctx.drawImage(res.player, 0, 0);
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	ctx.fillStyle = "black";
	//ctx.fillRect(x - 17, y - 12, 4, 4);
    }

    function draw_enemy(x, y) {
	ctx.drawImage(res.enemy, x - 10, y - 10);
    }

    function draw_bullet(x, y) {
	ctx.drawImage(res.bullet, x - 3, y - 3);
    }

    function draw_particle(x, y, radius) {
	ctx.drawImage(res.particle, x - radius, y - radius, 2 * radius, 2 * radius);
    }

    function draw_score(x) {
	ctx.fillStyle = "orange";
	ctx.textBaseline = "top";
	ctx.font = "20px sans-serif";
	ctx.fillText('Score: ' + x, 10, 10)
    }

    // The real loading and running of our wasm starts here
    let imports = { clear_screen, draw_player, draw_enemy, draw_bullet, draw_particle, draw_score };
    imports.Math_atan = Math.atan;
    imports.sin = Math.sin;
    imports.cos = Math.cos;
    return imports;
}

// Input processing
function processKey(key, b) {
    switch (key) {
    case "ArrowLeft":
	gamedata.toggle_turn_left(b);
	break;
    case "ArrowRight":
	gamedata.toggle_turn_right(b);
	break;
    case "ArrowUp":
	gamedata.toggle_boost(b);
	break;
    case " ":
	gamedata.toggle_shoot(b);
	break;
    }
}
document.addEventListener('keydown', e => processKey(e.key, true));
document.addEventListener('keyup', e => processKey(e.key, false));

// Resizing
function resize() {
    // We make the canvas somewhat smaller to get some zooming
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    gamedata.resize(canvas.width, canvas.height);
}
window.addEventListener('resize', () => {
    resize();
});

// Game loop
let start = null;
let prevTimestamp = null;
let drawAndUpdate = (timestamp) => {
    // Initialization
    if (!prevTimestamp) {
	start = timestamp;
	prevTimestamp = timestamp;
	requestAnimationFrame(drawAndUpdate);
	return;
    }

    // Update and draw
    let progress = (timestamp - prevTimestamp) / 1000;
    gamedata.update(gamedata, progress);
    gamedata.draw(gamedata);

    // Some bookkeeping
    prevTimestamp = timestamp;
    requestAnimationFrame(drawAndUpdate);
};
console.log(gamedata)
resize();
drawAndUpdate();
//});
