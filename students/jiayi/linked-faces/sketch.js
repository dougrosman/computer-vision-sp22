// The original face landmarks model: https://www.npmjs.com/package/@tensorflow-models/face-landmarks-detection

let model;
let faces;

const w = 640; // the width of the camera feed
const h = 480; // the height of the camera feed
const DISTANCE_THRESHOLD = 300; // lower threshold = closer distance to trigger linking
const LINE_SPARSNESS = 4; // higher sparsness = fewer lines. fewer lines = faster sketch
let linkedFaces = []; // stores the index of any face that is linked
let linkedPairs = []; // stores the index pairs of linked faces (e.g. [0, 1], [2, 3])
let unlinkedFaces = []; // stores index any face that is not linked

let windowScaleRatio;

function setup() {
  createCanvas(w, h);
  windowScaleRatio = innerWidth / w;
  canvas.style.transform = `scale(${windowScaleRatio})`;
  
  capture = createCapture(VIDEO);
  let v = document.querySelector('video')
  v.style.transform = `scale(${windowScaleRatio}, ${windowScaleRatio}) translate(100%, 0) scaleX(-1)`;
  colorMode(HSB, 255);
  // pixelDensity(1); // uncomment this if sketch is slow on retina display

  loadFaceModel();
}

function draw() {
  clear(); // clears the canvas each loop

  if (capture.loadedmetadata && model !== undefined) {
    getFaces();
  }

  if (faces !== undefined) {
    if(faces.length > 0) calculateLinks();
  }
}

function windowResized() {
  windowScaleRatio = innerWidth / w;
  canvas.style.transform = `scale(${windowScaleRatio})`;
  let v = document.querySelector('video')
  v.style.transform = `scale(${windowScaleRatio}, ${windowScaleRatio}) translate(100%, 0) scaleX(-1)`;
}

function mousePressed() {
  let fs = fullscreen();
  fullscreen(!fs);
}

////////////////////////////////////////////////////////////////////////////////////
/* CHANGE THE LOOK OF YOUR SKETCH IN THE scrambleFace() and linkFaces() FUNCTIONS */
////////////////////////////////////////////////////////////////////////////////////


// create a scramble of randomly generated lines on an individual's face
function scrambleFace(face) {
  for (let i = 0; i < face.scaledMesh.length; i += LINE_SPARSNESS) {
    let ri1 = floor(Math.random()*face.scaledMesh.length); // random index 1
    let ri2 = floor(Math.random()*face.scaledMesh.length); // random index 2

    let rlm1 = createVector(face.scaledMesh[ri1][0], face.scaledMesh[ri1][1]); // random landmark 1
    let rlm2 = createVector(face.scaledMesh[ri2][0], face.scaledMesh[ri2][1]); // random landmark 2

    // add any changes here

    stroke(Math.random() * 255, Math.random() * 255, Math.random() * 255);
    strokeWeight(1);
    
    
    beginShape(LINES);
    vertex(rlm1.x, rlm1.y);
    vertex(rlm2.x, rlm2.y);
    endShape();
    
  }
}

// link two faces together. This function makes it easy to apply face linking to 2 or more faces dynamically.
// the code is basically the same as the scrambleFace function above, but instead of picking to random indices from the same face, one random index is chosen from one face, and one random index is chosen from the other face
function linkFaces(face1, face2) {
  for (let i = 0; i < face1.scaledMesh.length; i += LINE_SPARSNESS) {
    let ri1 = floor(Math.random()*face1.scaledMesh.length); // random index 1
    let ri2 = floor(Math.random()*face2.scaledMesh.length); // random index 2

    let rlm1 = createVector(face1.scaledMesh[ri1][0], face1.scaledMesh[ri1][1]); // random landmark on face 1
    let rlm2 = createVector(face2.scaledMesh[ri2][0], face2.scaledMesh[ri2][1]); // random landmark on face 2

    // add any changes here

    let h = map(faces.length, 2, 6, 0, 255); // color changes with different # of faces
    stroke(h, 255, 255);
    strokeWeight(1);
    beginShape(LINES);
    vertex(rlm1.x, rlm1.y);
    vertex(rlm2.x, rlm2.y);
    endShape();
  }
}

function calculateLinks() {
  // if only one face detected, scramble the single face and don't do any distance calculations
  if (faces.length == 1) {
    scrambleFace(faces[0]);
  } else {

    // the following arrays are reset each frame
    linkedFaces = []; // stores the index of any face that is linked
    linkedPairs = []; // stores the index pairs of linked faces (e.g. [0, 1], [2, 3])
    unlinkedFaces = []; // stores index any face that is not linked

    // if more than one face is detected, determine if the should LINK or SCRAMBLE
    // we use a nested for-loop structure in order to test the distance of each face to each other face no matter how many faces are detected.

    // Let's say 4 faces are detected. How many distance calculations do we need to perform? 6!
    // 1. face 0 to face 1
    // 2. face 0 to face 2
    // 3. face 0 to face 3
    // 4. face 1 to face 2 (we don't need to do face 1 to face 0, since we already did that in the first step)
    // 5. face 1 to face 3 
    // 6. face 2 to face 3 (we don't need to do face 2 to face 0, or face 2 to face 1 since we already did those checks)

    // we also don't need to check each face to itself (e.g. face 0 to face 0, face 1 to face 1, etc.)

    /*
    // Let's imagine 5 faces are detected. Here are the values i and j will be each time through the loops...

     i = 0, j = 0,
     i = 0, j = 1,
     i = 0, j = 2,
     i = 0, j = 3,
     i = 0, j = 4,

     i = 1, j = 1,
     i = 1, j = 2,
     i = 1, j = 3,
     i = 1, j = 4,

     i = 2, j = 2,
     i = 2, j = 3,
     i = 2, j = 4,

     i = 3, j = 3,
     i = 3, j = 4,

     i = 4, j = 4,     
    */ 

    // the outer for-loop is simple: loop through each face
    for (let i = 0; i < faces.length; i++) {
      // the inner for-loop is a little more nuanced. Notice that we set j = i. This allows us to skip doing redundant checks
      for (let j = i; j < faces.length; j++) {

        let d; // a variable to store the distance between the current faces that are being checked

        // if i == j, that means the same face is being checked (e.g., face 1 to face 1), so we make sure to set the distance just beyond the threshold so that it automatically scrambles instead of links
        if (i == j) {
          d = DISTANCE_THRESHOLD + 1;
        } else {

          // store the position of the nose of the current two faces that are being checked
          let nose1 = createVector(
            faces[i].scaledMesh[0][0],
            faces[i].scaledMesh[0][1]
          );
          let nose2 = createVector(
            faces[j].scaledMesh[0][0],
            faces[j].scaledMesh[0][1]
          );

          // calculate the distance between the two noses
          d = p5.Vector.dist(nose1, nose2);
          linked = d < DISTANCE_THRESHOLD;
        }

        // if the faces are close together (d is less than DISTANCE_THRESHOLD), keep track of them as linked
        if (d < DISTANCE_THRESHOLD) {
          linkedFaces.push(i, j); // keeps track of which faces are linked
          linkedPairs.push([i, j]); // stores each pair of linked faces as its own array
        }
      }
      // checks the linkedFaces array for the current face.
      // indexOf() returns -1 if the array doesn't have the value you're looking for.
      if ((linkedFaces.indexOf(i) == -1)) {
        unlinkedFaces.push([i]); // store the current face as an unlinked face
      }
    }

    // once we've calculated which faces should link and which ones should scramble,
    // loop through the arrays we used to keep track of them, and draw the lines as needed
    for (let unlinked of unlinkedFaces) {
      scrambleFace(faces[unlinked[0]]);
    }

    for (let linked of linkedPairs) {
      linkFaces(faces[linked[0]], faces[linked[1]]);
    }
  }
}

async function loadFaceModel() {
  model = await faceLandmarksDetection.load(
    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
  );
}

async function getFaces() {
  const predictions = await model.estimateFaces({
    input: document.querySelector("video"),
    returnTensors: false,
    flipHorizontal: true,
    predictIrises: false, // set to 'false' if sketch is running too slowly
  });

  if (predictions.length === 0) {
    faces = undefined;
  } else {
    faces = predictions;
  }
}



