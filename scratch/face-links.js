// The actual helpful link: https://www.npmjs.com/package/@tensorflow-models/face-landmarks-detection


let model;
let faces;

const w = 640;
const h = 360;

let windowScaleRatio = 1;

function setup() {
  createCanvas(innerWidth, innerHeight);
  windowScaleRatio = innerWidth / w;
  capture = createCapture(VIDEO);
  capture.size(w, h);
  capture.hide();
  colorMode(HSB, 255);

  loadFaceModel();
}

function draw() {
  background(200);

  if (capture.loadedmetadata && model !== undefined) {
    getFaces();
  }

  // draw the camera feed
  push();
    scale(windowScaleRatio, windowScaleRatio);
    translate(w, 0);
    scale(-1, 1);
    image(capture, 0, 0);
  pop();

  // where the magic happens
  if (faces !== undefined) {
    const distanceThreshold = 350; // if two faces are closer than this, then link them
    
    // if only one face detected, scramble the single face and don't do any distance calculations
    if (faces.length == 1) {
      scrambleFace(faces[0]);
    } else {

      // if more than one face is detected, determine if the should LINK or SCRAMBLE
      // we use a nested for-loop structure in order to test the distance of each face to each other face no matter how many faces are detected.

      // Let's say 4 faces are detected. How many distance calculations do we need to perform? 6!
      // 1. face 1 to face 2
      // 2. face 1 to face 3
      // 3. face 1 to face 4
      // 4. face 2 to face 3 (we don't need to do face 2 to face 1, since we already did that in the first step)
      // 5. face 2 to face 4 
      // 6. face 3 to face 4 (we don't need to do face 3 to face 1, or face 3 to face 2 since we already did those checks)

      // we also don't need to check each face to itself (e.g. face 1 to face 1, face 2 to face 2, etc.)

      // the outer for-loop is simple: loop through each face
      for (let i = 0; i < faces.length; i++) {
        // the inner for-loop is a little more nuanced. Notice that we set j = i. This allows us to skip doing redundant checks
        for (let j = i; j < faces.length; j++) {
          
          let d; // a variable to store the distance between the current faces that are being checked
          
          // if i == j, that means the same face is being checked (e.g., face 1 to face 1), so we make sure to set the distance beyond the threshold so that it automatically scrambles
          if(i == j) {
            d = distanceThreshold + 1;
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
            linked = d < distanceThreshold;
            //console.log(j+", linked:"+linked)
          }

          // if the faces are far apart (d is greater than distance threshold, then scramble the face)
          if (d > distanceThreshold) {
            scrambleFace(faces[i]);
          } else {
            // if the faces are close together (d is less than the distance threshold, then link the faces)
            linkFaces(faces[i], faces[j]);
          }
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(innerWidth, innerHeight);
  windowScaleRatio = innerWidth / w;
}

// create a scramble of randomly generated lines on an individual's face
function scrambleFace(face) {
  for (let i = 0; i < face.scaledMesh.length; i += 4) {
    let ri1 = floor(random(face.scaledMesh.length)); // random index 1
    let ri2 = floor(random(face.scaledMesh.length)); // random index 2

    let rlm1 = createVector(face.scaledMesh[ri1][0], face.scaledMesh[ri1][1]); // random landmark 1
    let rlm2 = createVector(face.scaledMesh[ri2][0], face.scaledMesh[ri2][1]); // random landmark 2

    stroke(127, 255, 255);
    push();
    scale(windowScaleRatio, windowScaleRatio);
    beginShape(LINES);
      vertex(rlm1.x, rlm1.y);
      vertex(rlm2.x, rlm2.y);
    endShape();
    pop();
  }
}

// link two faces together. This function makes it easy to apply face linking to 2 or more faces dynamically.
// the code is basically the same as the scrambleFace function above, but instead of picking to random indices from the same face, one random index is chosen from one face, and one random index is chosen from the other face

function linkFaces(face1, face2) {
  for (let i = 0; i < face1.scaledMesh.length; i += 4) {
    let ri1 = floor(random(face1.scaledMesh.length)); // random index 1
    let ri2 = floor(random(face2.scaledMesh.length)); // random index 2

    let rlm1 = createVector(face1.scaledMesh[ri1][0], face1.scaledMesh[ri1][1]); // random landmark on face 1
    let rlm2 = createVector(face2.scaledMesh[ri2][0], face2.scaledMesh[ri2][1]); // random landmark on face 2

    let h = map(faces.length, 2, 6, 0, 255);
    stroke(h, 255, 255);
    push();
    scale(windowScaleRatio, windowScaleRatio);
    beginShape(LINES);
      vertex(rlm1.x, rlm1.y);
      vertex(rlm2.x, rlm2.y);
    endShape();
    pop();
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
