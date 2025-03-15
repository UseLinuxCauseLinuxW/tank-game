document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.createElement("canvas");
  canvas.id = "gameCanvas";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  canvas.width = 800;
  canvas.height = 600;

  const keys = {};
  document.addEventListener("keydown", (e) => keys[e.key] = true);
  document.addEventListener("keyup", (e) => keys[e.key] = false);

  // Affichage des contrôles
  const controlsDiv = document.createElement("div");
  controlsDiv.id = "controls";
  controlsDiv.innerHTML = `
    <h3>Contrôles</h3>
    <p><b>Joueur 1 (Tank Bleu)</b></p>
    <p>Déplacement : Z Q S D</p>
    <p>Tirer : F</p>
    <p><b>Joueur 2 (Tank Rouge)</b></p>
    <p>Déplacement : Flèches</p>
    <p>Tirer : O</p>
  `;
  document.body.appendChild(controlsDiv);

  document.body.style.display = "flex";
  document.body.style.justifyContent = "space-between";
  document.body.style.alignItems = "center";
  document.body.style.padding = "20px";
  document.body.style.height = "100vh";
  document.body.style.overflow = "hidden";

  controlsDiv.style.background = "rgba(255, 255, 255, 0.8)";
  controlsDiv.style.padding = "15px";
  controlsDiv.style.border = "1px solid black";
  controlsDiv.style.borderRadius = "5px";
  controlsDiv.style.width = "200px";
  controlsDiv.style.fontFamily = "Arial, sans-serif";
  controlsDiv.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";

  canvas.style.border = "2px solid black";
  canvas.style.display = "block";
  canvas.style.margin = "auto";

  function checkCollision(tank, bullet) {
    return tank.x < bullet.x + bullet.size &&
           tank.x + tank.size > bullet.x &&
           tank.y < bullet.y + bullet.size &&
           tank.y + tank.size > bullet.y;
  }

  class Tank {
    constructor(x, y, color, controls) {
      this.x = x;
      this.y = y;
      this.size = 40;
      this.speed = 3;
      this.color = color;
      this.controls = controls;
      this.lives = 3;
      this.tripleShot = false;
      this.bullets = [];
      this.direction = "right"; // Direction par défaut
      this.lastShotTime = 0; // Timer pour le tir (en ms)
    }
    move() {
      if (keys[this.controls.up] && this.y > 0) { this.y -= this.speed; this.direction = "up"; }
      if (keys[this.controls.down] && this.y + this.size < canvas.height) { this.y += this.speed; this.direction = "down"; }
      if (keys[this.controls.left] && this.x > 0) { this.x -= this.speed; this.direction = "left"; }
      if (keys[this.controls.right] && this.x + this.size < canvas.width) { this.x += this.speed; this.direction = "right"; }
    }
    shoot() {
      // Autoriser un tir toutes les 1 seconde (1000 ms)
      if (keys[this.controls.shoot] && Date.now() - this.lastShotTime > 1000) {
        let speedX = 0, speedY = 0;
        if (this.direction === "right") { speedX = 5; speedY = 0; }
        else if (this.direction === "left") { speedX = -5; speedY = 0; }
        else if (this.direction === "up") { speedX = 0; speedY = -5; }
        else if (this.direction === "down") { speedX = 0; speedY = 5; }
        if (this.tripleShot) {
          if (this.direction === "up" || this.direction === "down") {
            this.bullets.push(new Bullet(this.x + this.size/2, this.y + this.size/2, speedX - 2, speedY));
            this.bullets.push(new Bullet(this.x + this.size/2, this.y + this.size/2, speedX, speedY));
            this.bullets.push(new Bullet(this.x + this.size/2, this.y + this.size/2, speedX + 2, speedY));
          } else {
            this.bullets.push(new Bullet(this.x + this.size/2, this.y + this.size/2, speedX, speedY - 2));
            this.bullets.push(new Bullet(this.x + this.size/2, this.y + this.size/2, speedX, speedY));
            this.bullets.push(new Bullet(this.x + this.size/2, this.y + this.size/2, speedX, speedY + 2));
          }
        } else {
          this.bullets.push(new Bullet(this.x + this.size/2, this.y + this.size/2, speedX, speedY));
        }
        this.lastShotTime = Date.now();
        keys[this.controls.shoot] = false;
      }
    }
    update() {
      this.move();
      this.shoot();
      this.bullets.forEach(bullet => bullet.update());
      this.bullets = this.bullets.filter(bullet => bullet.bounces < 2);
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      this.bullets.forEach(bullet => bullet.draw());
    }
  }

  class Bullet {
    constructor(x, y, speedX, speedY) {
      this.x = x;
      this.y = y;
      this.speedX = speedX;
      this.speedY = speedY;
      this.size = 8;
      this.bounces = 0;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x <= 0 || this.x + this.size >= canvas.width) { this.speedX *= -1; this.bounces++; }
      if (this.y <= 0 || this.y + this.size >= canvas.height) { this.speedY *= -1; this.bounces++; }
    }
    draw() {
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const player1 = new Tank(100, 100, "blue", { up: "z", down: "s", left: "q", right: "d", shoot: "f" });
  const player2 = new Tank(600, 400, "red", { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", shoot: "o" });

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Collision balle/tank
    player1.bullets.forEach((bullet, i) => {
      if (checkCollision(player2, bullet)) {
        player2.lives--;
        player1.bullets.splice(i, 1);
      }
    });
    player2.bullets.forEach((bullet, i) => {
      if (checkCollision(player1, bullet)) {
        player1.lives--;
        player2.bullets.splice(i, 1);
      }
    });
    
    // Affichage des vies
    ctx.fillStyle = "blue";
    ctx.font = "20px Arial";
    ctx.fillText("Vies: " + player1.lives, 10, 30);
    ctx.fillStyle = "red";
    ctx.fillText("Vies: " + player2.lives, canvas.width - 100, 30);
    
    // Game Over
    if (player1.lives <= 0 || player2.lives <= 0) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "40px Arial";
      let winner = player1.lives <= 0 ? "Joueur Rouge gagne !" : "Joueur Bleu gagne !";
      ctx.fillText(winner, canvas.width/2 - 150, canvas.height/2);
      let btn = document.createElement("button");
      btn.innerText = "Recommencer";
      btn.style.position = "absolute";
      btn.style.top = "60%";
      btn.style.left = "50%";
      btn.style.transform = "translate(-50%, -50%)";
      btn.style.padding = "10px 20px";
      btn.style.fontSize = "20px";
      document.body.appendChild(btn);
      btn.addEventListener("click", () => location.reload());
      return;
    }
    
    player1.update();
    player2.update();
    player1.draw();
    player2.draw();
    requestAnimationFrame(gameLoop);
  }
  
  gameLoop();
});
