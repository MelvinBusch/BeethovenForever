const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = null;
const sounds = ["Couchkonzert_Stinger_01.wav"];
const pathToAudioFiles = "audio/";
const levels = [0, 0, -3, -10];
const loops = [];
const activeLoops = new Set();
let loopStartTime = 0;
const fadeTime = 0.2; 

let canvas;
let ctx;
let width, height;
const maxVoices = 1;
let voices = [];
let slider;
let mousePos = [0,0];
let dragging = false;

document.addEventListener("DOMContentLoaded", init);
document.addEventListener("dblclick", _event => {
  if (voices.length == 0) {
    let a = new Voice(_event.x, _event.y, slider.value)
    voices.push(a);
    a.playSound();
  } else {
    for (let i = 0; i < voices.length; i++) {
      let d = Math.sqrt(Math.pow(_event.x - voices[i].x, 2) + Math.pow(_event.y - voices[i].y, 2));
      if (d < 30) {
        voices[i].playSound();
        voices.splice(i, 1);
        break;
      } else if (voices.length < maxVoices) {
        let b = new Voice(_event.x, _event.y, slider.value)
        voices.push(b);
        b.playSound();
        break;
      }
    }
  }
});
document.addEventListener("mousemove", drag);
document.addEventListener("mousedown", () => dragging = true); // @ToDo: Move Dragging into Object
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
  loadLoops();

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
  for (let voice of voices)
    voice.show();

  window.requestAnimationFrame(animation);
}

function drag(_event) {
  mousePos[0] = _event.clientX;
  mousePos[1] = _event.clientY;
  if (dragging && voices[0]) {
    voices[0].update(mousePos[0], mousePos[1]);
  }
}

function loadLoops() {
  const decodeContext = new AudioContext();

  // load audio buffers
  for (let i = 0; i < sounds.length; i++) {
    const request = new XMLHttpRequest();
    request.responseType = 'arraybuffer';
    request.open('GET', pathToAudioFiles + sounds[i]);
    request.addEventListener('load', () => {
      decodeContext.decodeAudioData(request.response, (buffer) => {
        const button = document.querySelector(`div.button[data-index="${i}"]`);
        loops[i] = new Loop(buffer, button, levels[i])
      });
    });

    request.send();
  }
}

function onButton() {
  // const target = evt.target;
  // const index = target.dataset.index;
  // const loop = loops[index];
  const loop = loops[0];

  if (audioContext === null)
    audioContext = new AudioContext();

  if (loop) {
    const time = audioContext.currentTime;
    let syncLoopPhase = true;

    if (activeLoops.size === 0) {
      loopStartTime = time;
      syncLoopPhase = false;
      // window.requestAnimationFrame(displayIntensity);
    }

    if (!loop.isPlaying) {
      loop.start(time, syncLoopPhase);
    } else {
      loop.stop(time);
    }
  }
}

// function displayIntensity() {
//   for (let loop of activeLoops)
//     loop.displayIntensity();

//   if (activeLoops.size > 0)
//     window.requestAnimationFrame(displayIntensity);
// }

function decibelToLinear(val) {
  return Math.exp(0.11512925464970229 * val); // pow(10, val / 20)
}