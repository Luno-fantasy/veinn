const introScreen = document.getElementById("introScreen");
const floorScreen = document.getElementById("floorScreen");
const enterButton = document.getElementById("enterButton");
const backButton = document.getElementById("backButton");
const curtain = document.getElementById("transitionCurtain");
const soundToggle = document.getElementById("soundToggle");

let audioContext = null;
let ambientNodes = [];

function setActiveScreen(nextScreen, previousScreen) {
  previousScreen.classList.remove("is-active");
  previousScreen.setAttribute("aria-hidden", "true");

  nextScreen.classList.add("is-active");
  nextScreen.setAttribute("aria-hidden", "false");
}

function curtainTransition(callback) {
  curtain.classList.add("is-closing");

  window.setTimeout(() => {
    callback();
    window.setTimeout(() => {
      curtain.classList.remove("is-closing");
    }, 180);
  }, 760);
}

enterButton.addEventListener("click", () => {
  curtainTransition(() => setActiveScreen(floorScreen, introScreen));
});

backButton.addEventListener("click", () => {
  curtainTransition(() => setActiveScreen(introScreen, floorScreen));
});

document.querySelectorAll(".floor-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    event.preventDefault();
    const destination = card.getAttribute("href");

    curtain.classList.add("is-closing");
    window.setTimeout(() => {
      window.location.href = destination;
    }, 760);
  });
});

/*
  外部音源を使わず、Web Audio APIでごく小さな環境音を生成します。
  ブラウザの自動再生制限に合わせ、ユーザーがSOUNDを押した時だけ再生します。
*/
function startAmbientSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    soundToggle.querySelector(".sound-toggle__label").textContent = "UNAVAILABLE";
    return;
  }

  audioContext = new AudioContextClass();

  const master = audioContext.createGain();
  master.gain.value = 0.045;
  master.connect(audioContext.destination);

  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 320;
  filter.Q.value = 0.6;
  filter.connect(master);

  [55, 82.5, 110].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = index === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 0 ? 0.32 : 0.08;

    oscillator.connect(gain);
    gain.connect(filter);
    oscillator.start();

    ambientNodes.push(oscillator, gain);
  });

  const lfo = audioContext.createOscillator();
  const lfoGain = audioContext.createGain();
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 90;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();

  ambientNodes.push(master, filter, lfo, lfoGain);
}

function stopAmbientSound() {
  ambientNodes.forEach((node) => {
    try {
      if (typeof node.stop === "function") node.stop();
      if (typeof node.disconnect === "function") node.disconnect();
    } catch (_) {
      // 既に停止済みの場合は何もしない
    }
  });

  ambientNodes = [];

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

soundToggle.addEventListener("click", () => {
  const isOn = soundToggle.getAttribute("aria-pressed") === "true";

  if (isOn) {
    stopAmbientSound();
    soundToggle.setAttribute("aria-pressed", "false");
    soundToggle.querySelector(".sound-toggle__label").textContent = "SOUND OFF";
  } else {
    startAmbientSound();
    soundToggle.setAttribute("aria-pressed", "true");
    soundToggle.querySelector(".sound-toggle__label").textContent = "SOUND ON";
  }
});
