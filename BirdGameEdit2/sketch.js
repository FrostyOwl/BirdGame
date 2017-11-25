// illustrations with thanks to Paolo Pedercini,
// creator of p5.play, who included these with his examples.


// some variables for our main character (the protagonist)
// and the things the protagonist needs to collect
var protagonist, fish, worms, predator;


var gameScreen = "start"; // could also be, "play", "win", "lose"

// TODO: set appropriately for your game!
var numberOfEnemies = 1;
var numberOfFish = 5;
var numberOfWorms = 10;

var textColor;

var victorySong;
var gameOverSong;

// animations declared in the global scope so they can be used in
// preload & recycled again in start game
var predatorAnimation;
var wormAnimation;
var fishAnimation;
var mcWalkingAnimation;
var mcFlyingAnimation;
var mcEatingWormAnimation;
var mcEatingFishAnimation;
var mcStandingAnimation;

var bgImg;
var victorybgImage;
var gameOverbgImage;

function preload() {

  // TODO: replace with your sprites and background images!!

  // animations are filled in with multiple .png files
  // in a directory that are numbered sequentially.
  mcStandingAnimation = loadAnimation("assets/BirdStanding_0.png", "assets/BirdStanding_1.png");
  mcStandingAnimation.frameDelay = 15;
  mcWalkingAnimation = loadAnimation("assets/BirdWalking_0.png", "assets/BirdWalking_1.png");
  mcWalkingAnimation.frameDelay = 15;
  mcFlyingAnimation = loadAnimation("assets/BirdFlying_0.png", "assets/BirdFlying_1.png");
  mcFlyingAnimation.frameDelay = 15;
  mcEatingWormAnimation = loadAnimation("assets/BirdEatingWorm_0.png", "assets/BirdEatingWorm_1.png");
  mcEatingWormAnimation.frameDelay = 15;
  mcEatingFishAnimation = loadAnimation("assets/BirdEatingFish_0.png", "assets/BirdEatingFish_1.png");
  mcEatingFishAnimation.frameDelay = 15;

  predatorAnimation = loadAnimation("assets/Predator_0.png", "assets/Predator_1.png", "assets/Predator_2.png", "assets/Predator_3.png", "assets/Predator_4.png");
  predatorAnimation.frameDelay = 10;
  wormAnimation = loadAnimation("assets/Worm_00.png", "assets/Worm_01.png", "assets/Worm_02.png", "assets/Worm_03.png", "assets/Worm_04.png", "assets/Worm_05.png", "assets/Worm_06.png", "assets/Worm_07.png", "assets/Worm_08.png", "assets/Worm_09.png");
  wormAnimation.frameDelay = 15;
  fishAnimation = loadAnimation("assets/Fish_0.png", "assets/Fish_1.png");
  fishAnimation.frameDelay = 15;
  
  victorybgImage = loadAnimation("assets/WinScreen_0.png", "assets/WinScreen_1.png");
  victorybgImage.frameDelay = 15;
  gameOverbgImage = loadAnimation("assets/GameOver_1.png", "assets/GameOver_2.png", "assets/GameOver_3.png", "assets/GameOver_4.png", "assets/GameOver_5.png", "assets/GameOver_6.png");
  gameOverbgImage.frameDelay = 15;

  // make a background image 2-3x the size of these
  // remember: the retina display has a higher density!
  // some ratio of:
  // 412 x 604 (android)
  // 375 x 559 (iOS)
  bgImg = loadImage("assets/Background.png");
  
  
  victorySong = loadSound("assets/BeepBox-Win.wav");
  gameOverSong = loadSound("assets/BeepBox-Game Over.wav")
}


function setup() {

  // canvas
  createCanvas(window.innerWidth, window.innerHeight);
  rectMode(CENTER);
  textAlign(CENTER);

  // colors and parameters
  textColor = color(255);

  // for tilting our phones
  setMoveThreshold(0.1);

  // well: let's start on the start screen!
  gameScreen = "start";
}

function deviceMoved() {
      protagonist.position.x += map(rotationY, -180, 180, -15, 15);
      protagonist.position.y += map(rotationX, -180, 180, -15, 15);
    }


function draw() {
  // clear out the background.
  background(0, 69, 155);

  // cover back area with an image (our example has some transparency in it,
  // so we still see the background color)
  imageMode(CENTER);
  image(bgImg, width / 2, height / 2, width, height);

  // go through the various screens of our game and draw or perform
  // various actions as appropriate.
  // NOTE: input (touches, tilting the phone, etc.) is not handled here!
  // look in touchStarted and deviceMoved for those details.
  if (gameScreen === "start") {

    fill(textColor);
    text("Touch anywhere to start", width / 2, height / 2);

  } else if (gameScreen === "play") {

    // game is ongoing!

    // call the "collect" function (defined below) when the protagonist
    // overlaps with one of the collectibles.
    protagonist.overlap(fish, collect);
    protagonist.overlap(worms, collect);


    // and likewise, call the loseGame function when the protagonist
    // collides with an enemy!
    protagonist.overlap(predator, loseGame);

    // and: if we're playing back the happy dance, we only want to play it once,
    // then to go back to our "normal" state.
    if (protagonist.getAnimationLabel() === "eatWorm" && protagonist.animation.getFrame() == protagonist.animation.getLastFrame()) {
      protagonist.changeAnimation("walk");
    }
    if (protagonist.getAnimationLabel() === "eatFish" && protagonist.animation.getFrame() == protagonist.animation.getLastFrame()) {
      protagonist.changeAnimation("fly");
    }

    // default: bounce sprites off edges, keep them in bounds
    keepAllSpritesInBounds();
    //wrapAllSpritesAround();

    // TODO: uncomment if you want the protagonist to follow where the screen is touched!
    protagonist.position.x = touchX;
    protagonist.position.y = touchY;
    
    // draw all of the characters and things.
    drawSprites();

  } else if (gameScreen === "win") {

    drawSprites();
    
    fill(textColor);
    text("You Survived!\nTap anywhere to play again.", width / 2, height / 2);

    //DO play BirdStanding or BirdFlying animation

  } else {

    drawSprites();

    fill(textColor);
    text("You Were Food! \nTap anywhere to play again.", width / 2, height / 2);

    //DO play Predator animation

  }
}

// GAME PLAY AND LOGISTICS -----------------------------------------

/*
 * START GAME: reset any timers, scores, collectibles, or enemies here.
 * re-position your protagonist.
 */
function startGame() {
  gameScreen = "play";

  // remove old/stale sprites from previous game, if needed.
  for (var i = allSprites.length - 1; i >= 0; i--) {
    var sprite = allSprites[i];
    sprite.remove();
  }

  var pX = width / 2;
  var pY = height / 2;

  // TODO: set your protagonist width & height here
  // based on the IMAGE it uses!
  var pWidth = 72;
  var pHeight = 158;

  // our protagonist is a ghost-looking creature with two animations:
  // - "normal" which is just the when they walk around
  // - "happy" which is a happy dance when they grab one of the collectibles
  // starts in middle of screen, fits in a 50x50 rectangle
  protagonist = createSprite(pX, pY);
  protagonist.addAnimation("eatWorm", mcEatingWormAnimation);
  protagonist.addAnimation("walk", mcWalkingAnimation);
  protagonist.addAnimation("fly", mcFlyingAnimation);
  protagonist.addAnimation("eatFish", mcEatingFishAnimation);
  protagonist.addAnimation("stand", mcStandingAnimation);


  // CREATE THE COLLECTIBLES!
  worms = new Group();
  for (i = 0; i < numberOfWorms; i++) {
    // just put these in a random place

    var dot = createSprite(random(10, width - 10), random(165, height - 10));

    // TODO: set your images here!
    dot.addAnimation("normal", wormAnimation);
    // TODO: control the movement of collectibles here!
    dot.setVelocity(0, 0);
    
    worms.add(dot);
    //wormAnimation.frameDelay = random(10,20);
  }

  fish = new Group();
  for (i = 0; i < numberOfFish; i++) {
    // just put these in a random place

    dot = createSprite(random(10, width - 10), random(10, 160));

    // TODO: set your images here!
    dot.addAnimation("normal", fishAnimation);
    // TODO: control the movement of collectibles here!
 
    dot.setVelocity(random(-2, 2), 0);
    

    fish.add(dot);
    
    //if (-2 <= velocity < 0){
      //fishAnimation.mirrorY(dir);
    //}
  }

  // CREATE THE ENEMIES!
  predator = new Group();
  // TODO: update based on image size of your enemy!
  var eWidth = 130;
  var eHeight = 132;
  var clearance = max(eWidth, eHeight) + max(pWidth, pHeight);
  for (i = 0; i < numberOfEnemies; i++) {
    // just put these in a random place
    // but outside of a certain radius around the
    // protagonist.
    var angle = random(-PI, PI);
    var r = clearance;
    var baddie = createSprite(pX + r * cos(angle), pY + r * sin(angle));

    // circle shaped! and actually a little smaller than the image
    // so that the enemy is visibly overlapped with the protagonist when
    // the game ends!
    baddie.setCollider("circle", 0, 0, 60);

    // TODO: set your images here!
    baddie.addAnimation("normal", predatorAnimation);
    // TODO: control the movement of enemies here!
    baddie.setVelocity(random(-5, 5), random(-5, 5));

    predator.add(baddie);
  }

  protagonist.changeAnimation("walk");


  //var x;
  //var y;
  //var easing = 0.05;

  //function Pos() {

  //var targetX = touchX;
  //var dx = targetX - x;
  //x += dx * easing;

  //var targetY = touchY;
  //var dy = targetY - y;
  //y += dy * easing;

  //protagonist.position.x = (x);
  //protagonist.position.y = (y);
  //}

  //Pos();

  if (ptouchX == touchX) {
    protagonist.changeAnimation("stand")
  }
}


function winGame() {
  // TODO: do something better here!

  // sprite celebration
  // DO make protagonist centered
  // DO white 
  protagonist.changeAnimation("stand");

  if (gameScreen != "win") {
    // TODO: play a sound!
    victorySong.play();
    
    protagonist.addAnimation("victory", victorybgImage);
    victory;
    
  }

  gameScreen = "win";
}

function loseGame(character, baddie) {
  // TODO: do something better here!
  // maybe set a sad animation for your sprite?


  baddie.velocity.x = 0;
  baddie.velocity.y = 0;

  if (gameScreen != "lose") {
    // TODO: play a sound!
    gameOverSong.play();
  }

  gameScreen = "lose";
}


function wrapSpriteAround(sprite) {
  if (sprite.position.x < -sprite.width / 2) {
    sprite.position.x = width - 1;
  } else if (sprite.position.x > (width + sprite.width / 2)) {
    sprite.position.x = 1;
  }

  if (sprite.position.y < -sprite.height / 2) {
    sprite.position.y = height - 1;
  } else if (sprite.position.y > (height + sprite.height / 2)) {
    sprite.position.y = 1;
  }
}


function wrapAllSpritesAround() {
  //all sprites bounce at the screen edges
  for (var i = 0; i < collectibles.length; i++) {
    var s = collectibles[i];
    wrapSpriteAround(s);
  }

  for (var i = 0; i < enemies.length; i++) {
    var s = enemies[i];
    wrapSpriteAround(s);
  }
}

function keepSpriteInBounds(sprite) {
  if (sprite.position.x < 0) {
    sprite.position.x = 1;
    sprite.velocity.x = abs(sprite.velocity.x);
  }

  if (sprite.position.x > width) {
    sprite.position.x = width - 1;
    sprite.velocity.x = -abs(sprite.velocity.x);
  }

  if (sprite.position.y < 0) {
    sprite.position.y = 1;
    sprite.velocity.y = abs(sprite.velocity.y);
  }

  if (sprite.position.y > height) {
    sprite.position.y = height - 1;
    sprite.velocity.y = -abs(sprite.velocity.y);
  }
}

function keepAllSpritesInBounds() {
  //all sprites bounce at the screen edges
  for (var i = 0; i < fish.length; i++) {
    var s = fish[i];
    keepSpriteInBounds(s);
  }

  for (i = 0; i < predator.length; i++) {
    s = predator[i];
    keepSpriteInBounds(s);
  }
}


//the first parameter will be the sprite (individual or from a group) 
//calling the function
//the second parameter will be the sprite (individual or from a group)
//against which the overlap, collide, bounce, or displace is checked
function collect(collector, collected) {
  //collector is another name for protagonist
  //show the animation
  // if (){collector.changeAnimation("eatFish"); //DO fish vs worm collected
  collector.animation.rewind();
  //collected is the sprite in the group collectibles that triggered 
  //the event
  collected.remove();

  if (fish.length === 0 && worms.length === 0)
    winGame();
}

// USER INPUT ----------------------------------------------------------------

function mouseClicked() {
  if (gameScreen === "start" || gameScreen === "lose" || gameScreen === "win") {
    startGame();
  }
}

function touchStarted() {
  if (gameScreen === "start" || gameScreen === "lose" || gameScreen === "win") {
    startGame();
  }
}

function mouseMoved() {
  if (screen === "play") {
    // the protagonist is an object with a position property or field.
    // this field has an x and y subfield, which determines where the
    // protagonist is drawn on screen.
    // here's how it would follow the mouse:
    protagonist.position.x = mouseX;
    protagonist.position.y = mouseY;
  }
}

function deviceMoved() {
  protagonist.position.x += map(rotationY, -180, 180, -15, 15);
  protagonist.position.y += map(rotationX, -180, 180, -15, 15);
}

document.ontouchmove = function(event) {
  event.preventDefault();
}