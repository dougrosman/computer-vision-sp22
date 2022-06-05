function setup() {
  createCanvas(innerWidth, innerHeight);
  textAlign(CENTER);
}

function draw() {
  background(200);

  textSize(22);
  text("basic sketch responsive", width/2, height/2);
}

function windowResized() {
  resizeCanvas(innerWidth, innerHeight);
}