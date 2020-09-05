var cvs = document.getElementById('responsive-canvas');
var heightRatio = 1.1;
cvs.height = cvs.width * heightRatio;
var ctx = cvs.getContext('2d');



// load images
var plane = new Image();
var bg = new Image();
var storm1 = new Image();
var storm2 = new Image();
var star = new Image();

plane.src = "images/plane.png";
bg.src = "images/bg.png";
storm1.src = "images/storm1.png";
storm2.src = "images/storm2.png";
star.src = "images/star.png";

// audio files
// var coin = new Audio();
// var colision = new Audio();
// var gameOver = new Audio();
coin_src = "sounds/coin.mp3";
colision_src = "sounds/colision2.mp3";
gameOver_src = "sounds/gameover.mp3";
plane_src = "sounds/plane.mp3";


// some variables
var constant = 85;
var score = 0;
var plane_x = cvs.width/2;
var plane_y = 2*cvs.height/3;
var plane_width = cvs.width/9;
var plane_height = cvs.width/9;
var shape;
var k = 1;
var lives = 3;
var storms = [];
var limit = Math.floor(cvs.height/(2*k))*k;
var start = false;

storms[0] = {
    x: cvs.width/2,
    y: 0,
    wx: 100,
    xy: 100,
    st: storm1
};
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }

//Movimientos
document.addEventListener("keydown",move);

function move(){
    
    switch (event.key) {
        case "ArrowLeft":
            if (plane_x>cvs.width/30){
                plane_x -= cvs.width/30;
            }
            break;
        case "ArrowRight":
            if (plane_x<cvs.width-cvs.width/8){
                plane_x += cvs.width/30;
            }
            break;
    }
}

function play_F(file){
    var audio = document.createElement('audio');
    audio.src = file;
    document.body.appendChild(audio);
    audio.play();
    audio.onended = function () {
      this.parentNode.removeChild(this);
    }
  }

  function gameStart(){
      start = true;
  }




function calculatePosition(){
    let velocity = sessionStorage.getItem("Velocity");
    let acceleration = sessionStorage.getItem("Acceleration");
    console.log('Variaton:', velocity/5000 + acceleration/500)
    plane_x = plane_x + 4*(velocity/5000 + acceleration/500);
    if (plane_x > cvs.width){
        plane_x=0;
    }
    else if (plane_x < 0){
        plane_x = cvs.width
    }
} 


function draw(){
    document.getElementById("score").innerHTML = score;
    document.getElementById("lives").innerHTML = lives;
    ctx.drawImage(bg, 0, 0, cvs.width, cvs.height);
    if (start){
        calculatePosition();
        for(var i=0; i<storms.length; i++){
            if (storms[i].st != null)
            {
                ctx.drawImage(storms[i].st,storms[i].x,storms[i].y, storms[i].wx, storms[i].wy);
                // Movimiento:
                storms[i].y = storms[i].y + k; 
                // Agrego nuevas tormentas:
                if( storms[i].y == limit ){ // Ojo con esto: si K no es divisor de 300 puede no entrar nunca en esta condicion.
                    
                    shape = (Math.random() * cvs.width/10)+cvs.width/20
                    switch(Math.floor(Math.random() * 3)) {
                        case 0:
                            storms.push({
                                x : Math.floor(Math.random()*(cvs.width-shape)),
                                y : 0,
                                st: storm1,
                                wx: shape,
                                wy:shape
                            }); 
                        break;
                        case 1:
                            storms.push({
                                x : Math.floor(Math.random()*(cvs.width-shape)),
                                y : 0,
                                st: storm2,
                                wx: shape,
                                wy:shape
                            }); 
                        break;
                        default:
                            storms.push({
                                x : Math.floor(Math.random()*(cvs.width-shape)),
                                y : 0,
                                st: star,
                                wx: cvs.width/10,
                                wy: cvs.width/10
                            }); 
                    }
                }
                // Detectar choque:
                if(storms[i].st != star && storms[i].x >= plane_x && storms[i].x <= plane_x + plane_width && storms[i].y+storms[i].wy > plane_y && storms[i].y <= plane_y+plane_height|| storms[i].st != star && storms[i].x <= plane_x && storms[i].x + storms[i].wx >= plane_x && storms[i].y+storms[i].wy > plane_y && storms[i].y <= plane_y+plane_height){
                    //colision.play();
                    play_F(colision_src);
                    lives --;
                    storms[i].st = null; 
                    if(lives == 0){
                        play_F(gameOver_src);
                        //gameOver.play();
                        sleep(5000);
                        location.reload();  
                    }
                }
                // Sumo un punto por tormenta esquivada
                if(storms[i].y == cvs.height && storms[i].st != star){
                    score++;
                }
                // Recolectar estrella suma 10 puntos
                if(storms[i].st == star && storms[i].x >= plane_x && storms[i].x <= plane_x + plane_width && storms[i].y+storms[i].wy > plane_y && storms[i].y <= plane_y+plane_height|| storms[i].st == star && storms[i].x <= plane_x && storms[i].x + storms[i].wx >= plane_x && storms[i].y+storms[i].wy > plane_y && storms[i].y <= plane_y+plane_height){
                    score += 10;
                    
                    //coinplay();
                    play_F(coin_src);
                    storms[i].st = null; 
                }
            }
        }
    }
    ctx.drawImage(plane, plane_x, plane_y, plane_width, plane_height);

    // Vuelve a llamar la funcion y genera el bucle
    requestAnimationFrame(draw);
}

draw();


