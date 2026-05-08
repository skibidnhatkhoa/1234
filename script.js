const canvas =
document.getElementById("game");

const ctx =
canvas.getContext("2d");

canvas.width =
window.innerWidth;

canvas.height =
window.innerHeight;

// ========= UI =========

const scoreEl =
document.getElementById("score");

const bestEl =
document.getElementById("bestScore");

const finalScoreEl =
document.getElementById("finalScore");

const menu =
document.getElementById("menu");

const gameOverScreen =
document.getElementById("gameOver");

const playBtn =
document.getElementById("playBtn");

const restartBtn =
document.getElementById("restartBtn");

// ========= GAME =========

let bird;
let pipes;
let particles;

let score = 0;

let bestScore =
localStorage.getItem("bestScore")
|| 0;

bestEl.innerText =
bestScore;

let gameRunning = false;

let lastTime = 0;

let pipeTimer = 0;

// ========= RESET =========

function resetGame(){

  bird = {

    x:180,

    y:300,

    radius:28,

    velocity:0,

    gravity:0.45,

    jumpForce:-10,

    rotation:0,

    wing:0,

    update(){

      this.velocity +=
      this.gravity;

      this.y +=
      this.velocity;

      this.rotation =
      Math.min(
        this.velocity * 3,
        25
      );

      this.wing += .3;
    },

    draw(){

      ctx.save();

      ctx.translate(
        this.x,
        this.y
      );

      ctx.rotate(
        this.rotation *
        Math.PI/180
      );

      // glow

      ctx.shadowBlur = 35;
      ctx.shadowColor =
      "#00f0ff";

      // body

      ctx.fillStyle =
      "#ff2e63";

      ctx.beginPath();

      ctx.arc(
        0,
        0,
        this.radius,
        0,
        Math.PI*2
      );

      ctx.fill();

      // mario hat

      ctx.fillStyle =
      "#ff0000";

      ctx.fillRect(
        -25,
        -35,
        50,
        14
      );

      // eye

      ctx.fillStyle =
      "white";

      ctx.beginPath();

      ctx.arc(
        10,
        -5,
        6,
        0,
        Math.PI*2
      );

      ctx.fill();

      // wing

      ctx.fillStyle =
      "#ffd166";

      ctx.beginPath();

      ctx.ellipse(

        -20,

        Math.sin(
          this.wing
        ) * 10,

        18,
        10,

        0,
        0,
        Math.PI*2
      );

      ctx.fill();

      ctx.restore();
    }
  };

  pipes = [];

  particles = [];

  score = 0;

  scoreEl.innerText =
  score;
}

// ========= PIPE =========

function createPipe(){

  const gap = 220;

  const topHeight =
  Math.random() *
  (canvas.height-450)
  + 100;

  pipes.push({

    x:canvas.width,

    width:120,

    top:topHeight,

    bottom:
    canvas.height -
    topHeight -
    gap,

    passed:false
  });
}

// ========= PARTICLES =========

function createParticles(x,y){

  for(let i=0;i<25;i++){

    particles.push({

      x:x,
      y:y,

      vx:
      (Math.random()-.5)*8,

      vy:
      (Math.random()-.5)*8,

      size:
      Math.random()*6+2,

      life:1
    });
  }
}

function updateParticles(){

  particles.forEach(p=>{

    p.x += p.vx;

    p.y += p.vy;

    p.life -= .02;
  });

  particles =
  particles.filter(
    p=>p.life > 0
  );
}

function drawParticles(){

  particles.forEach(p=>{

    ctx.globalAlpha =
    p.life;

    ctx.fillStyle =
    "#00f0ff";

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      p.size,
      0,
      Math.PI*2
    );

    ctx.fill();

    ctx.globalAlpha = 1;
  });
}

// ========= DRAW PIPES =========

function drawPipes(){

  pipes.forEach(pipe=>{

    const gradient =
    ctx.createLinearGradient(
      pipe.x,
      0,
      pipe.x+pipe.width,
      0
    );

    gradient.addColorStop(
      0,
      "#00f0ff"
    );

    gradient.addColorStop(
      1,
      "#ff00ea"
    );

    ctx.fillStyle =
    gradient;

    ctx.shadowBlur = 25;
    ctx.shadowColor =
    "#00f0ff";

    // top

    ctx.fillRect(
      pipe.x,
      0,
      pipe.width,
      pipe.top
    );

    // bottom

    ctx.fillRect(

      pipe.x,

      canvas.height -
      pipe.bottom,

      pipe.width,

      pipe.bottom
    );

    ctx.shadowBlur = 0;
  });
}

// ========= UPDATE =========

function update(delta){

  bird.update();

  pipes.forEach(pipe=>{

    pipe.x -=
    6 * delta;

    // SCORE

    if(

      !pipe.passed &&

      pipe.x + pipe.width <
      bird.x

    ){

      pipe.passed = true;

      score++;

      scoreEl.innerText =
      score;

      if(score > bestScore){

        bestScore = score;

        localStorage.setItem(
          "bestScore",
          bestScore
        );

        bestEl.innerText =
        bestScore;
      }
    }

    // COLLISION

    if(

      bird.x + bird.radius >
      pipe.x &&

      bird.x - bird.radius <
      pipe.x + pipe.width &&

      (

        bird.y - bird.radius <
        pipe.top ||

        bird.y + bird.radius >

        canvas.height -
        pipe.bottom

      )
    ){

      explode();
    }
  });

  pipes =
  pipes.filter(
    pipe =>
    pipe.x + pipe.width > 0
  );

  updateParticles();

  // FLOOR

  if(

    bird.y + bird.radius >
    canvas.height ||

    bird.y - bird.radius < 0
  ){

    explode();
  }
}

// ========= DRAW =========

function draw(){

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawPipes();

  bird.draw();

  drawParticles();
}

// ========= EXPLODE =========

function explode(){

  createParticles(
    bird.x,
    bird.y
  );

  gameRunning = false;

  finalScoreEl.innerText =
  score;

  gameOverScreen
  .classList.remove(
    "hidden"
  );
}

// ========= LOOP =========

function animate(timestamp){

  if(!gameRunning) return;

  const delta =
  (timestamp-lastTime)
  / 16.67;

  lastTime = timestamp;

  update(delta);

  draw();

  pipeTimer += delta;

  if(pipeTimer > 90){

    createPipe();

    pipeTimer = 0;
  }

  requestAnimationFrame(
    animate
  );
}

// ========= START =========

function startGame(){

  resetGame();

  menu.classList.add(
    "hidden"
  );

  gameOverScreen
  .classList.add(
    "hidden"
  );

  gameRunning = true;

  requestAnimationFrame(
    animate
  );
}

// ========= JUMP =========

function jump(){

  if(!gameRunning) return;

  bird.velocity =
  bird.jumpForce;
}

// ========= EVENTS =========

playBtn.onclick =
startGame;

restartBtn.onclick =
startGame;

window.addEventListener(
  "keydown",
  e=>{

    if(e.code==="Space"){

      e.preventDefault();

      jump();
    }
  }
);

window.addEventListener(
  "mousedown",
  jump
);

window.addEventListener(
  "resize",
  ()=>{

    canvas.width =
    innerWidth;

    canvas.height =
    innerHeight;
  }
);
