class Loop {
  constructor(buffer, button, level = 0) {
    this.buffer = buffer;
    this.button = button;
    this.amp = decibelToLinear(level);
    this.gain = null;
    this.source = null;
    this.analyser = null;
    this.mouseGainValue = 1;
  }

  start(time, sync = true) {
    const buffer = this.buffer;
    let analyser = this.analyser;
    let offset = 0;

    if (analyser === null) {
      analyser = audioContext.createAnalyser();
      this.analyser = analyser;
      this.analyserArray = new Float32Array(analyser.fftSize);
    }

    const gain = audioContext.createGain();
    gain.connect(mouseGain);
    gain.connect(analyser);

    const mouseGain = audioContext.createGain();
    mouseGain.gain.value = this.mouseGainValue;
    mouseGain.connect(audioContext.destination);

    if (sync) {
      // fade in only when starting somewhere in the middle
      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(this.amp, time + fadeTime);

      // set offset to loop time
      offset = (time - loopStartTime) % buffer.duration;
    }

    const source = audioContext.createBufferSource();
    source.connect(gain);
    source.buffer = buffer;
    source.loop = true;
    source.start(time, offset);

    this.source = source;
    this.gain = gain;

    activeLoops.add(this);
    // this.button.classList.add('active');
  }

  stop(time) {
    this.source.stop(time + fadeTime);
    this.gain.gain.setValueAtTime(this.amp, time);
    this.gain.gain.linearRampToValueAtTime(0, time + fadeTime);

    this.source = null;
    this.gain = null;

    activeLoops.delete(this);
    // this.button.classList.remove('active');
    // this.button.style.opacity = 0.25;
  }

  displayIntensity() {
    const analyser = this.analyser;

    if (analyser.getFloatTimeDomainData) {
      const array = this.analyserArray;
      const fftSize = analyser.fftSize;

      analyser.getFloatTimeDomainData(array);

      let sum = 0;
      for (let i = 0; i < fftSize; i++) {
        const value = array[i];
        sum += (value * value);
      }

      // const opacity = Math.min(1, 0.25 + 10 * Math.sqrt(sum / fftSize));
      // this.button.style.opacity = opacity;
    }
  }

  updateMouseGain(_x, _y) {
    let d = Math.sqrt(Math.pow(_x - voices[i].x, 2) + Math.pow(_y - voices[i].y, 2));
    if (d < 100) {
      this.mouseGainValue = this.map(d, 0, 100, 0, 1);
    }
  }

  get isPlaying() {
    return (this.source !== null);
  }

  map(value, x1, y1, x2, y2) {
    return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
  }
}

function decibelToLinear(val) {
  return Math.exp(0.11512925464970229 * val); // pow(10, val / 20)
}


/*
- Button nur für Styling?
- Nach Ablauf eines Loops einen neuen Loop starten?
- 


*/