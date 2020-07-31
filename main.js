const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = null;
const pathToAudioFiles = "audio/";
const levels = [0, 0, -3, -10];
const loops = [];
const activeLoops = new Set();
let loopStartTime = 0;
const fadeTime = 4; 

let canvas;
let ctx;
let width, height;
const maxVoices = 1;
let voices = [];
let slider;
let mousePos = [0,0];
let dragging = false;

const sounds = ["Scherzo_04.wav", "Waldstein_03.wav", "StreichquartettNo9_02.wav", "StreichquartettNo14_02.wav", "Violinenkonzert_01.wav"];
const MATRIX = [];
MATRIX[0] = [1200, 150]; // Scherzo
MATRIX[1] = [600, 400];  // Waldstein
MATRIX[2] = [300, 120];  // Streichquartett No. 9
MATRIX[3] = [220, 600];  // Streichquartett No. 14
MATRIX[4] = [1200, 600]; // Violinenkonzert in D
// console.log(MATRIX[0]);

const voiceRadius = 600;


window.addEventListener("load", init);
document.addEventListener("mousemove", drag);
document.addEventListener("mousedown", () => dragging = true);
document.addEventListener("mouseup", () => dragging = false);

function init() {
  // Setup Canvas
  canvas = document.getElementById("canvas1");
  ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  width = canvas.width;
  height = canvas.height;

  // Setup Slider
  slider = document.getElementById("timeslider");

  // Load Loops
  loadSounds();

  document.addEventListener("dblclick", _event => {
    if (voices.length == 0) {
      let a = new Voice(_event.x, _event.y)
      voices.push(a);
      for (let loop of loops) {
        playSound(loop);
      }
    } else {
      for (let i = 0; i < voices.length; i++) {
        let d = Math.sqrt(Math.pow(_event.x - voices[i].x, 2) + Math.pow(_event.y - voices[i].y, 2));
        if (d < 30) {
          clearInterval(voices[i].updateTimer);
          for (let loop of loops) {
            playSound(loop);
          }
          voices.splice(i, 1);
          break;
        } else if (voices.length < maxVoices) {
          let b = new Voice(_event.x, _event.y, slider.value)
          voices.push(b);
          break;
        }
      }
    }
  });

  // Start Animation
  window.requestAnimationFrame(animation);
}

function animation() {
  ctx.clearRect(0, 0, width, height);

  // Background Mesh
  let dim = width / 15
  ctx.save();
  ctx.strokeStyle = "#888";
  for (let x = 0; x <= width; x += dim) {
    for (let y = 0; y <= height; y += dim) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.fillStyle = "rgba(0, 0, 0, .2)";
      ctx.arc(x, y, 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }
  ctx.restore();

  // Show Voices
  for (let voice of voices) {
    voice.show();
  }

  for (let i = 0; i < voices.length; i++) {
    for (let j = 0; j < loops.length; j++) {
      let a  = Math.pow(Math.floor(voices[i].x) - loops[j].matrixPosition[0], 2);
      let b  = Math.pow(Math.floor(voices[i].y) - loops[j].matrixPosition[1], 2);
      let d = Math.floor(Math.sqrt(a + b));
      let level = mapValue(d, voiceRadius, 0, 0, 1);
      if (level < 0) {
        level = 0;
      } else if (level > 1) {
        level = 1;
      }
      loops[j].setGain(level);
    }
  }
  window.requestAnimationFrame(animation);
}

function drag(_event) {
  mousePos[0] = _event.clientX;
  mousePos[1] = _event.clientY;
  if (dragging && voices[0]) {
    voices[0].update(mousePos[0], mousePos[1]);
  }
}

function loadSounds() {
  const decodeContext = new AudioContext();
  // Load Audio Buffers
  for (let i = 0; i < sounds.length; i++) {
    const request = new XMLHttpRequest();
    request.responseType = 'arraybuffer';
    request.open('GET', pathToAudioFiles + sounds[i]);
    request.addEventListener('load', () => {
      decodeContext.decodeAudioData(request.response, (buffer) => {
        loops[i] = new Loop(buffer, MATRIX[i]);
        // console.log(loops[i]);
      });
    });
    request.send();
  }
}

function playSound(_sound) {
  let loop = loops[1];
  if (_sound) {
    loop = _sound;
  }
  
  if (audioContext === null)
    audioContext = new AudioContext();

  if (loop) {
    const time = audioContext.currentTime;
    let syncLoopPhase = true;

    if (activeLoops.size === 0) {
      loopStartTime = time;
      syncLoopPhase = false;
    }

    if (!loop.isPlaying) {
      loop.start(time, syncLoopPhase);
    } else {
      loop.stop(time);
    }
  }
}

function mapValue(value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// Hall
// var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// var convolver = audioCtx.createConvolver();

// var soundSource, concertHallBuffer;

// let ajaxRequest = new XMLHttpRequest();
// ajaxRequest.open('GET', 'LargeHall.wav', true);
// ajaxRequest.responseType = 'arraybuffer';

// ajaxRequest.onload = function() {
//   var audioData = ajaxRequest.response;
//   audioCtx.decodeAudioData(audioData, function(buffer) {
//       concertHallBuffer = buffer;
//       soundSource = audioCtx.createBufferSource();
//       soundSource.buffer = concertHallBuffer;
//     }, function(e){"Error with decoding audio data" + e.err});
// }

// ajaxRequest.send();