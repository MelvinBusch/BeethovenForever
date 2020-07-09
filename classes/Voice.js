class Voice {
  constructor(_x, _y, _z) {
    this.x = _x;
    this.y = _y;
    this.z = _z;
    // this.c = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
    this.c = "rgb(240, 88, 97)";
    this.matrix = [1, 2];
    this.tempMatrix = this.matrix;
    this.updateMatrix();
    this.updateTimer;
    // this.playSound();
  }

  update(_x, _y) {
    this.x = _x;
    this.y = _y;
  }

  updateMatrix() {
    this.updateTimer = window.setInterval(() => {
      this.matrix = [Math.floor(this.map(this.x, 0, width, 1, 6)), Math.floor(this.map(this.y, 0, height, 1, 5))];
      if (JSON.stringify(this.matrix) != JSON.stringify(this.tempMatrix)) {
        // console.log("Position changed!");
        // => Do what happens when position changes
        // this.playSound(2);
      }
      this.tempMatrix = this.matrix;
      // console.log(this.matrix);
    }, 1500);
  }

  show() {
    ctx.beginPath();
    ctx.fillStyle = this.c;
    ctx.arc(this.x, this.y, 30, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  map(value, x1, y1, x2, y2) {
    return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
  }
}



// function onButton() {
//   // const target = evt.target;
//   // const index = target.dataset.index;
//   // const loop = loops[index];
//   const loop = loops[0];

//   if (audioContext === null)
//     audioContext = new AudioContext();

//   if (loop) {
//     const time = audioContext.currentTime;
//     let syncLoopPhase = true;

//     if (activeLoops.size === 0) {
//       loopStartTime = time;
//       syncLoopPhase = false;
//       // window.requestAnimationFrame(displayIntensity);
//     }

//     if (!loop.isPlaying) {
//       loop.start(time, syncLoopPhase);
//     } else {
//       loop.stop(time);
//     }
//   }
// }