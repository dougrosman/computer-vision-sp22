let w = 640;
let h = 480;
let capture;

function setup() {
  createCanvas(innerWidth, innerHeight);
  capture = createCapture(VIDEO);
  capture.size(w, h);
  capture.hide();
  offset = createVector(0, 0);
}

function draw() {
  background(100, 0, 0);

  push();
    scale(setScale(), setScale());
    translate(w, 0);
    scale(-1, 1);
    image(capture, 0, 0);
  pop();

}

function windowResized() {
  resizeCanvas(innerWidth, innerHeight);
}

function setScale() {
  if(innerWidth/w >= innerHeight/h) {
    return innerWidth/w;
  }
  else {
    return innerHeight/h;
  }
}