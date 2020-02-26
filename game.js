const cvs = document.getElementById("bird");
//luam contextul care returneaza metodele si 
//proprietatile care ne permit sa desenam convasul
const ctx = cvs.getContext("2d");

let frames = 0;
// ne ajuta sa transformam din grade in radian
const DEGREE = Math.PI/180;

//incarca (load) sprite image
const sprite = new Image();
sprite.src = "img/sprite.png";

//game state
const state = { 
    current : 0,
    getReady : 0,
    game : 1,
    over :2
}

// control the game 
cvs.addEventListener("click", function (evt){
    switch(state.current){
        case state.getReady :
            state.current = state.game;
            break;
        case state.game :
            bird.flap();
            break;
        case state.over:
            state.current=state.getReady;
            break;
    }
});

//background-ul de pe funndal
const bg ={
     sX : 0,
     sY : 0,
     w : 275,
     h : 226,
     x : 0,
     // punem asa pt ca imaginea sa fie pusa in partea de jos a convasului
     y : cvs.height -226,

     draw: function () { 
         ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.y);
         ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x+this.w, this.y, this.w, this.y);
        }
}

// foreground (partea de pe suprafata)
const fg={
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y:cvs.height -112,

    dx: 2,

    draw: function(){
        // imaginea fiind mai ingusta decat convas-ul va trebuie sa punem de 2 ori aceeasi imagine una langa alta
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x +this.w, this.y, this.w, this.h);
    },

    update: function(){
        if(state.current == state.game){
            this.x=(this.x - this.dx) % (this.w/2);
        }
    }
}

 const bird ={
     animation : [
         {sX: 276,sY: 112},
         {sX: 276,sY: 139},
         {sX: 276,sY: 164},
         {sX: 276,sY: 139}
     ],

     x : 50,
     y : 150,
     w : 34,
     h : 26,

     frame : 0,


     gravity : 0.25,
     jump : 4.6,
     speed : 0,
     rotation:0,

     draw : function(){
         let bird = this.animation[this.frame];
        //salvam contextul initial
         ctx.save();

         ctx.translate(this.x,this.y);
         ctx.rotate(this.rotation);
         ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h,  - this.w/2, - this.h/2, this.w, this.h);
        
         //facem restore la contextul initial
         ctx.restore();
       },

     flap : function(){
            this.speed = - this.jump;
     },

     update:function(){
        // cand State este pe pozitia de getReady atunci bird va da din aripi mai lent iar cand incepe jocul va zbura mai repede
        //in functie de perioada pe care o setam
        this.period = state.current ==state.getReady ? 10 :5;

        // incrementam variabila frame la fiecare perioada/ altfel nu incrementeaza
        this.frame += frames % this.period == 0 ? 1 : 0;

        //in vectorul care contine animatiile avem 4 pozitii de zbor
        //de aceea, atunci cand frame va fi mai mare decat 3, frame se va reseta de la 0 (pana cand ajunge din nou la 3)
        this.frame= this.frame % this.animation.length;

        if(state.current == state.getReady){
            this.y = 150; // resetam pozitia pasarii cand e game over
            this.rotation= 0 * DEGREE;
        }
        else{
            this.speed += this.gravity;
            this.y += this.speed;

            if(this.y + this.h/2 >= cvs.height - fg.h){
                this.y =  cvs.height - fg.h - this.h/2;

                 if( state.current == state.game){
                     state.current = state.over;
                 }
            }

            //daca viteza este mai mare decat Jump inseamna ca pasarea va cade
            if(this.speed >= this.jump){
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            }
            else{
                this.rotation = -25 * DEGREE;
            }
        }
     }
 }

 // Get Ready message
 const getReady = {
    sX: 0, 
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width/2 - 173/2,
    y: 80,

    draw : function(){
        if(state.current == state.getReady){
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        } 
    }
 }

 // Game over message 
 const gameOver = {
    sX: 175, 
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width/2-225/2,
    y: 90,

    draw : function(){
        if(state.current == state.over)
        {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }

 }
//pilonii
const pipes = {
    position : [],

    top : {
        sX : 553,
        sY : 0
    },
    bottom : {
        sX : 502,
        sY : 0
    },

    w : 53,
    h : 400,
    gap : 85,
    maxYPos : -150,
    dx : 2,

    draw : function(){
        for ( let i=0; i< this.position.length; i++){
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            //top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);
            
            //bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);            
        }
    },

    update: function(){
        if(state.current !== state.game)return;

        if(frames % 100 == 0){
            this.position.push({
                x : cvs.width,
                y : this.maxYPos * (Math.random() + 1)
            });
        }

        for( let i = 0; i < this.position.length;i++)
        {
            let p =this.position[i];

            p.x -= this.dx;
        }
    }
}

/* functie care ne permite sa prindem toate desenele 
care fac convasul
*/
function draw(){
    //contextul nostru va avea culoarea albastru(culoarea cerului)
    // practic se sterge ce pe frame-ul vechi
    ctx.fillStyle = "#70c5ce";

    //va desena din contextul creat de la
    //coorodonatele 0 0 ale convasului pana la width si height ale convasului 
    ctx.fillRect( 0, 0, cvs.width, cvs.height);

    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
}
function update(){
    bird.update();
    fg.update();
    pipes.update();
}
// avem nevoie de functia de loop pentru a face update 
// la fiecare secunda
function loop(){

    //update() va face update la pozitiile imaginilor 
    // care se vor misca
    update();
    draw();
    //numara cate frame-uri au fost desenate pe convas
    frames++;

    //aceasta functie va apela functia loop de 50 ori
    // pe secunde( in medie)
    requestAnimationFrame(loop);
}
loop();