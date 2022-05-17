//为最终版本进行的更改
//左边：盲人的幻觉；右边转换成点
// The actual helpful link: https://www.npmjs.com/package/@tensorflow-models/face-landmarks-detection


// let faces;
// // let detector;
let model;
let faces;
const w = 640;
const h = 480;
let shouldTakePhoto = true;
let captureTime = 0;

//sound
let song;

// left video variables
let lc;
let capture;
let previousPixels;
var threshold = 40; // lower threshold means letters will only stop on very dark spots
const fallRate = 1; // higher == faster letters
var fallingLetters = [];

let textCanvas;


//souund
function preload() {
  song = loadSound('You are beautiful .mp3');
  //play([startTime]);
}

function setup() {
  createCanvas(w * 2, h);
  
  lc = createGraphics(w, h);
  textCanvas = createGraphics(w * 2, h);

  capture = createCapture(VIDEO,
    function () {
      console.log('capture ready.')
    }
  );

  capture.size(w, h);
  capture.hide();

  loadFaceModel();

  colorMode(HSB, 255);

  frameRate(30);

  //检测停止的部分
  capture.elt.setAttribute('playsinline', '');

  //sound
  song = loadSound('You are beautiful .mp3');

}


//function mousePressed() {
  //if (song.isPlaying()) {
    // .isPlaying() returns a boolean
    //song.stop();
  //} else {
    //song.play();
  //}
  //setLoop(Boolean);
//}


function draw() {
  
  //background(0);
  if (capture.loadedmetadata && model !== undefined) {
    getFaces();
  }

  
  rightVideo();
  leftVideo();
}


//左边视频
function leftVideo() {

  //lc.fill(120, 255, 150);
  //lc.rect(0, 0, w, h);

  capture.loadPixels();
  var total = 0;
  if (capture.pixels.length > 0) {
    // don't forget this!
    if (!previousPixels) {
      previousPixels = copyImage(capture.pixels, previousPixels);
    } else {
      // var w = capture.width,
      //   h = capture.height;
      var i = 0;
      var pixels = capture.pixels;
      // var thresholdAmount = (select("#thresholdAmount").value() * 255) / 100;
      var thresholdAmount = 120;
      thresholdAmount *= 3; // 3 for r, g, b
      
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          // calculate the differences 计算数值
          var rdiff = Math.abs(pixels[i + 0] - previousPixels[i + 0]);
          var gdiff = Math.abs(pixels[i + 1] - previousPixels[i + 1]);
          var bdiff = Math.abs(pixels[i + 2] - previousPixels[i + 2]);
          // copy the current pixels to previousPixels
          previousPixels[i + 0] = pixels[i + 0];
          previousPixels[i + 1] = pixels[i + 1];
          previousPixels[i + 2] = pixels[i + 2];
          var diffs = rdiff + gdiff + bdiff;
          var output = 200;
          if (diffs > thresholdAmount) {
            output = 30000;
            total += diffs;
          }
          pixels[i++] = output;
          pixels[i++] = output;
          pixels[i++] = output;
          // also try this:
          // pixels[i++] = rdiff;
          // pixels[i++] = gdiff;
          // pixels[i++] = bdiff;
          i++; // skip alpha
        }
      }
    }
    lc.push();

    lc.translate(w, 0);
    lc.scale(-1, 1);
    lc.image(capture, 0, 0);
    
    //图中的字
    lc.pop();
    textCanvas.textStyle(BOLD);
      textCanvas.fill(255, 255, 255);
      textCanvas.textSize(8);
      textCanvas.textAlign(CENTER)
      textCanvas.text('', w/2, h/2);
      

  }

  //////////// add anything else you want below this line

  //摇晃
  //rectMode(CENTER);
  //translate(width / 10, height / 10);
  //lc.translate(p5.Vector.fromAngle(millis() / 9000, 6));


  //渲染效果
  lc.blendMode(DIFFERENCE);
  //strokeWeight(20);
  //stroke(255, 255, 245);




  // need this because sometimes the frames are repeated
  if (total > 0) {
    //select("#motion").elt.innerText = total;
    capture.updatePixels();
    lc.image(capture, 0, 0);
  }
  for (let i = 0; i < fallingLetters.length; i++) {
    if (total > 3000) {
      fallingLetters[i].y++;


      // loop through all the fallingLetters
      for (let i = 0; i < fallingLetters.length; i++)
        if (fallingLetters[i].y >= h) {
          fallingLetters[i].y = 0;
        }

        // else, the fallingLetter keeps falling
        else {
          fallingLetters[i].y += fallRate;
        }
    }


    // draw the fallingLetters to the screen
    lc.push();
    for (let f of fallingLetters) {
      lc.fill(0, 255, 0);
      lc.text(f.char, f.x, f.y + 300);

      lc.strokeWeight(0);
      
      //text('Seeing a bunny and saying it is cute,', 240, 60);
      //text('Seeing a lion and saying it is scary.', 60, 80);
      //text('Never knew how they bled and loved each other', 160, 100);
      //text('On the night of the storm.', 20, 120);
      //text('To free and entangle.', 380, 140);
      //text('Before building an ego，', 80, 160);
      //text('Destroy it.', 500, 180);


      //字母雨颜色参数
      fill(2000, 26, 1000);
      let red = random(2000);
      let g = random(79);
      let b = random(4000);

    }
    //字母雨大小参数
    lc.textSize(35);
    lc.textStyle(BOLD);
    //text('Font Style Bold', 10, 65);
    let red = random(0);
    let g = random(0);
    let b = random(0);

    //fill (red,g,b); rgb, colors
    //fill(25, 70, 10);

    //字母雨位置参数
    lc.text(fallingLetters[i].char, fallingLetters[i].x + 37, fallingLetters[i].y);
    
  }

  image(lc, 0, 0);
  image(textCanvas, 0, 0);

}

//右边视频
function rightVideo() {
  noStroke();


  fill(255, 0, 255);
  rect(w, 0, w, h);

  if (faces !== undefined) {
    for (const f of faces) {
      push();
      translate(w, 0);


      //let h = 0;

      //嘴巴内轮廓
      const month = [61, 191, 80, 81, 82, 13, 312, 311, 310, 415, 291, 324, 318, 402, 317, 14, 87, 178, 88, 95, 61]
      //左眼
      const lefteye = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7, 33]
      //右眼
      const righteye = [362, 398, 384, 385, 386, 387, 388, 466, 263, 249, 390, 373, 374, 380, 381, 382, 362]
      //鼻子
      const nose = [122, 6, 351, 419, 456, 363, 360, 279, 358, 327, 326, 2, 97, 98, 129, 49, 131, 134, 236, 196, 122]
      //左鼻孔
      const leftNostrils = [79, 166, 59, 75, 60, 20, 238, 79]
      //右鼻孔
      const rightNostrils = [309, 392, 289, 305, 290, 250, 456, 309]
      //嘴唇/外圈
      const lips = [0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146, 61, 185, 40, 39, 37]
      //左眉毛
      const leftEyebrows = [107, 55, 65, 52, 53, 46, 124, 70, 63, 105, 66, 107]
      //右眉毛
      const rightEyebrows = [336, 296, 334, 293, 300, 353, 276, 283, 282, 295, 285, 336]
      //外轮廓
      const face = [151, 337, 299, 333, 298, 301, 368, 264, 447, 366, 401, 435, 367, 364, 394, 395, 369, 396, 175, 171, 140, 170, 169, 135, 138, 215, 177, 137, 227, 34, 139, 71, 68, 104, 69, 108, 151]
      //左边眼球
      const leftEyeball = [160, 159, 158, 153, 145, 144, 160]
      //右边眼球
      const rightEyeball = [385, 386, 387, 373, 374, 380, 385]




      //嘴巴内轮廓
      for (let i = 0; i < month.length; i++) {
        const mon = f.scaledMesh[month[i]];
        fill(252, 244, 14);
        ellipse(mon[0], mon[1], 2)
      }
      //左眼
      for (let i = 0; i < lefteye.length; i++) {
        const le = f.scaledMesh[lefteye[i]];
        fill(0);
        ellipse(le[0], le[1], 3)
      }

      //右眼
      for (let i = 0; i < righteye.length; i++) {
        const re = f.scaledMesh[righteye[i]];
        fill(0);
        ellipse(re[0], re[1], 3)
      }

      //鼻子
      for (let i = 0; i < nose.length; i++) {
        const no = f.scaledMesh[nose[i]];
        fill(0);
        ellipse(no[0], no[1], 3)
      }

      //左鼻孔
      for (let i = 0; i < leftNostrils.length; i++) {
        const lns = f.scaledMesh[leftNostrils[i]];
        fill(0);
        ellipse(lns[0], lns[1], 1)
      }

      //右鼻孔
      for (let i = 0; i < rightNostrils.length; i++) {
        const rns = f.scaledMesh[rightNostrils[i]];
        fill(0);
        ellipse(rns[0], rns[1], 1)
      }


      //嘴唇
      for (let i = 0; i < lips.length; i++) {
        const lip = f.scaledMesh[lips[i]];
        fill(0);
        ellipse(lip[0], lip[1], 3)
      }

      //左眉毛
      for (let i = 0; i < leftEyebrows.length; i++) {
        const lb = f.scaledMesh[leftEyebrows[i]];
        fill(0);
        ellipse(lb[0], lb[1], 2.5)
      }

      //右眉毛
      for (let i = 0; i < rightEyebrows.length; i++) {
        const rb = f.scaledMesh[rightEyebrows[i]];
        fill(0);
        ellipse(rb[0], rb[1], 2.5)
      }

      //外轮廓
      for (let i = 0; i < face.length; i++) {
        const fa = f.scaledMesh[face[i]];
        fill(0);
        ellipse(fa[0], fa[1], 5)
      }

      //左边眼球
      for (let i = 0; i < leftEyeball.length; i++) {
        const lb = f.scaledMesh[leftEyeball[i]];
        fill(0);
        ellipse(lb[0], lb[1], 3)
      }

      //右边眼球
      for (let i = 0; i < rightEyeball.length; i++) {
        const rb = f.scaledMesh[rightEyeball[i]];
        fill(0);
        ellipse(rb[0], rb[1], 3)
      }

      pop();

      
      //眼距-储存照片
      // check distance between eyes to trigger photo
      let lEye = createVector(f.scaledMesh[133][0], f.scaledMesh[133][1])
      let rEye = createVector(f.scaledMesh[362][0], f.scaledMesh[362][1])
      let eyeDistance = lEye.dist(rEye);
      // console.log("eyeDistance: ", eyeDistance)

      // fill(0, 255, 255)
      // textSize(150);
      // text(floor(eyeDistance), w+100, h/2);

      //相片储存
      const PHOTO_DELAY = 2000

      if (eyeDistance > 80 && millis() - captureTime > PHOTO_DELAY ) {
        save("URBeautiful.jpg")
        //song.isPlaying()
        song.play();

        // shouldTakePhoto = false;
        captureTime = millis()

      } 
    
    }
  }

}

class FallingLetter {
  constructor(char, x, y) {
    this.char = char;
    this.x = x;
    this.y = y;
  }
}

function drawSilhouette(f) {
  beginShape();
  for (const kp of f.annotations.silhouette) {
    const keyPoint = createVector(kp[0], kp[1]);
    vertex(keyPoint.x, keyPoint.y);
  }
  endShape(CLOSE);
}

function drawEyes(f) {

  textSize(4);
  noStroke();
  for (const kp of f.annotations.leftEyeLower0) {
    fill(0, 259, 259);
    // ellipse(kp[0], kp[1], 2, 2);
    text("l0", kp[0], kp[1]);
  }

  for (const kp of f.annotations.leftEyeLower1) {
    fill(37, 259, 259);
    // ellipse(kp[0], kp[1], 2, 2);
    text("l1", kp[0], kp[1]);
  }

  for (const kp of f.annotations.leftEyeLower2) {
    fill(74, 259, 259);
    // ellipse(kp[0], kp[1], 2, 2);
    text("l2", kp[0], kp[1]);
  }

  for (const kp of f.annotations.leftEyeLower3) {
    fill(111, 259, 259);
    // ellipse(kp[0], kp[1], 2, 2);
    text("l3", kp[0], kp[1]);
  }

  for (const kp of f.annotations.leftEyeUpper0) {
    fill(148, 259, 259);
    // ellipse(kp[0], kp[1], 2, 2);
    text("u0", kp[0], kp[1]);
  }

  for (const kp of f.annotations.leftEyeUpper1) {
    fill(185, 259, 259);
    // ellipse(kp[0], kp[1], 2, 2);
    text("u1", kp[0], kp[1]);
  }

  for (const kp of f.annotations.leftEyeUpper2) {
    fill(222, 259, 259);
    // ellipse(kp[0], kp[1], 2, 2);
    text("u2", kp[0], kp[1]);
  }
}


async function loadFaceModel() {
  model = await faceLandmarksDetection.load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh)

  console.log(model);
}

async function getFaces() {
  const predictions = await model.estimateFaces({
    input: document.querySelector("video"),
    returnTensors: false,
    flipHorizontal: true,
    predictIrises: false // set to 'false' if sketch is running too slowly
  })

  if (predictions.length === 0) {
    faces = undefined;
  } else {
    faces = predictions;
  }
}


function copyImage(src, dst) {
  var n = src.length;
  if (!dst || dst.length != n) dst = new src.constructor(n);
  while (n--) dst[n] = src[n];
  return dst;
}


function detectMotion() {
  capture.loadPixels();
  var total = 0;
  if (capture.pixels.length > 0) { // don't forget this!
    if (!previousPixels) {
      previousPixels = copyImage(capture.pixels, previousPixels);
    } else {
      var w = capture.width,
        h = capture.height;
      var i = 0;
      var pixels = capture.pixels;
      var thresholdAmount = map(mouseX, 0, width, 0, 255)
      // var thresholdAmount = select('#thresholdAmount').value() * 255. / 100.;
      thresholdAmount *= 3; // 3 for r, g, b
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          // calculate the differences
          var rdiff = Math.abs(pixels[i + 0] - previousPixels[i + 0]);
          var gdiff = Math.abs(pixels[i + 1] - previousPixels[i + 1]);
          var bdiff = Math.abs(pixels[i + 2] - previousPixels[i + 2]);
          // copy the current pixels to previousPixels
          previousPixels[i + 0] = pixels[i + 0];
          previousPixels[i + 1] = pixels[i + 1];
          previousPixels[i + 2] = pixels[i + 2];
          var diffs = rdiff + gdiff + bdiff;
          var output = 0;
          if (diffs > thresholdAmount) {
            output = 255;
            total += diffs;
          }
          pixels[i++] = output;
          pixels[i++] = output;
          pixels[i++] = output;
          // also try this:
          // pixels[i++] = rdiff;
          // pixels[i++] = gdiff;
          // pixels[i++] = bdiff;
          i++; // skip alpha
        }
      }
    }
  }
  // need this because sometimes the frames are repeated
  if (total > 0) {
    //select('#motion').elt.innerText = total;
    capture.updatePixels();
    //image(capture, 0, 0, 640, 480);
  }

  return total;

}

setTimeout(function(){

  console.log("refresh");
  // const URL = window.location.href;

  window.location.href = window.location.href;

}, 10000)

//function mousePressed() {
  //save("myimage.jpg")
