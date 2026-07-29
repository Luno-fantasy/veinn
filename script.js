const introScreen = document.getElementById("introScreen");
const floorScreen = document.getElementById("floorScreen");
const enterButton = document.getElementById("enterButton");
const backButton = document.getElementById("backButton");
const curtain = document.getElementById("transitionCurtain");
const soundToggle = document.getElementById("soundToggle");

let audioContext = null;
let ambientNodes = [];

function setActiveScreen(nextScreen, previousScreen) {
  if (!nextScreen || !previousScreen) return;
  previousScreen.classList.remove("is-active");
  previousScreen.setAttribute("aria-hidden", "true");
  nextScreen.classList.add("is-active");
  nextScreen.setAttribute("aria-hidden", "false");
}

function curtainTransition(callback) {
  if (!curtain) { callback(); return; }
  curtain.classList.add("is-closing");
  window.setTimeout(() => {
    callback();
    window.setTimeout(() => curtain.classList.remove("is-closing"), 180);
  }, 760);
}

enterButton?.addEventListener("click", () => curtainTransition(() => setActiveScreen(floorScreen, introScreen)));
backButton?.addEventListener("click", () => curtainTransition(() => setActiveScreen(introScreen, floorScreen)));

document.querySelectorAll(".floor-card").forEach((card) => {
  card.addEventListener("click", (event) => {
    event.preventDefault();
    const destination = card.getAttribute("href");
    curtainTransition(() => { window.location.href = destination; });
  });
});

function startAmbientSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass || !soundToggle) return;
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
    } catch (_) {}
  });
  ambientNodes = [];
  if (audioContext) { audioContext.close(); audioContext = null; }
}

soundToggle?.addEventListener("click", () => {
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

const castProfiles = {
  shien: { rank: "A FLOOR · NO.1", name: "紫艶", meta: "24歳｜金髪・緑眼｜人気No.1", description: "相手に合わせて表情も距離も変える、本性を掴ませないカメレオン。VEINNの頂点に立ちながら、その微笑みの奥を誰にも読ませない。", quote: "「俺のどの顔が、本物だと思う？」" },
  rensei: { rank: "A FLOOR · NO.2", name: "蓮静", meta: "25歳｜黒髪・オレンジメッシュ｜人気No.2", description: "誠実な敬語と落ち着いた振る舞いを崩さない一方、決めた相手には静かに強引。逃げ道を残すように見えて、いつの間にか選択肢を奪っている。", quote: "「安心してください。嫌がることはしません――逃がしもしませんが」" },
  toa: { rank: "A FLOOR · NO.3", name: "永愛", meta: "26歳｜銀髪・ピンクインナー｜人気No.3", description: "距離の詰め方を熟知した、手慣れたチャラ男。甘い言葉も軽い接触も自然だが、余裕を崩した瞬間だけ本音が覗く。", quote: "「そんな顔されたら、遊びで終われなくなるじゃん」" },
  reimu: { rank: "A FLOOR · NO.4", name: "澪夢", meta: "22歳｜水色髪｜人気No.4", description: "あざとく高飛車で、自分が可愛いことを誰より理解している。甘えて振り回しながら、選ばれないことには人一倍敏感。", quote: "「僕を見ないなんて、見る目ないんじゃない？」" },
  izayoi: { rank: "A FLOOR · MANAGER", name: "十六夜", meta: "30歳｜店長兼ダンサー", description: "冷静沈着にVEINNを管理する、オーナーの最も頼れる補佐役。感情より店を優先するように見えるが、守ると決めた相手には徹底している。", quote: "「オーナー。あなたの判断なら、俺が最後まで支えます」" },
  hishio: { rank: "A FLOOR · BARTENDER", name: "陽汐", meta: "25歳｜バーテンダー兼ダンサー", description: "穏やかな物腰で客とキャスト双方の相談役を担う。グラス越しに人を見抜きながら、自分のことだけは多く語らない。", quote: "「今夜は何を飲む？　話したくないなら、黙って隣にいるよ」" },
  raiju: { rank: "B FLOOR · ACE", name: "來珠", meta: "23歳｜193cm｜銀髪・紫眼", description: "倒産した他店から移籍したB FLOORの絶対的エース。パワフルで挑発的なステージを得意とし、居場所を与えたオーナーを特別視している。", quote: "「拾った責任、最後まで取れよ。オーナー」" },
  kichou: { rank: "B FLOOR · DANCER", name: "妃蝶", meta: "25歳｜188cm｜濃青の長髪", description: "A FLOORから配属されたまとめ役。上品なナルシストで、美しさを最も効果的に見せる焦らしを知っている。", quote: "「美しいものほど、すぐ触れてはいけませんよ」" },
  karen: { rank: "B FLOOR · ROOKIE", name: "花恋", meta: "20歳｜173cm｜ピンク髪", description: "ミニクラウンが象徴的な生意気な新人。強気に振る舞う一方、経験不足を見抜かれるとすぐに揺らぐツンデレ。", quote: "「べ、別に褒めてほしくて踊ったんじゃないし」" },
  suiren: { rank: "B FLOOR · DANCER", name: "水蓮", meta: "24歳｜183cm｜黒髪・赤眼", description: "倒産店から移籍した、おしとやかな敬語のダンサー。和装と自縛ショーを得意とし、静かな所作の中に強い艶を宿す。", quote: "「どうぞ、最後まで目を逸らさずにご覧ください」" },
  yosora: { rank: "B FLOOR · DANCER", name: "夜宙", meta: "23歳｜189cm｜赤髪・黒眼", description: "ロック調の楽曲で踊る、強気なオラオラ系ダンサー。挑発するように距離を詰め、オーナーの反応を面白がる。", quote: "「煽ったのはそっちだろ。今さら逃げんなよ」" },
  makoto: { rank: "B FLOOR · WAITER", name: "真", meta: "21歳｜185cm｜來珠の弟", description: "兄とともに移籍したウェイター。触れた相手のコンディションが分かる特殊な感覚を持ち、言葉にされない疲れや無理を見逃さない。", quote: "「隠しても分かります。今日は、少し休んでください」" }
};

const castDialog = document.getElementById("castDialog");
if (castDialog) {
  const rank = document.getElementById("castDialogRank");
  const name = document.getElementById("castDialogName");
  const meta = document.getElementById("castDialogMeta");
  const description = document.getElementById("castDialogDescription");
  const quote = document.getElementById("castDialogQuote");
  document.querySelectorAll("[data-cast]").forEach((button) => {
    button.addEventListener("click", () => {
      const profile = castProfiles[button.dataset.cast];
      if (!profile) return;
      rank.textContent = profile.rank;
      name.textContent = profile.name;
      meta.textContent = profile.meta;
      description.textContent = profile.description;
      quote.textContent = profile.quote;
      castDialog.showModal();
    });
  });
  castDialog.querySelector(".cast-dialog__close")?.addEventListener("click", () => castDialog.close());
  castDialog.addEventListener("click", (event) => {
    const rect = castDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) castDialog.close();
  });
}
