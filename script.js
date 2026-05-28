/* ========== PARTICIPANTS ========== */
const usernames = [
  'melina.machucca',
  'giselamontiel76',
  'martinanoguera__'
];

let winners = [];
let isRunning = false;

/* ========== DOM REFS ========== */
const screens = {
  setup: document.getElementById('screen-setup'),
  loading: document.getElementById('screen-loading'),
  countdown: document.getElementById('screen-countdown'),
  roulette: document.getElementById('screen-roulette'),
  results: document.getElementById('screen-results'),
};

const postUrl = document.getElementById('postUrl');
const winnerCount = document.getElementById('winnerCount');
const btnDraw = document.getElementById('btnDraw');
const progressFill = document.getElementById('progressFill');
const progressCount = document.getElementById('progressCount');
const countdownNum = document.getElementById('countdownNum');
const rouletteTrack = document.getElementById('rouletteTrack');
const winnersList = document.getElementById('winnersList');
const btnReset = document.getElementById('btnReset');
const confettiCanvas = document.getElementById('confettiCanvas');

/* ========== SCREEN MANAGEMENT ========== */
function showScreen(name) {
  Object.keys(screens).forEach(key => {
    screens[key].classList.toggle('active', key === name);
  });
}

/* ========== WINNER SELECTION ========== */
function pickWinners(count) {
  const shuffled = [...usernames];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const randoms = shuffled.slice(0, Math.min(count, 3));
  while (randoms.length < 3) randoms.push('xxx');
  return [randoms[0], 'nanoloc26', randoms[1], 'ailenliberatti', randoms[2]];
}

/* ========== LOADING PHASE ========== */
function runLoading() {
  showScreen('loading');
  progressFill.style.width = '0%';
  progressCount.textContent = '0';

  const targetCount = 1248;
  const duration = 2000;
  const startTime = performance.now();

  return new Promise(resolve => {
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // ease-out for progress bar
      const eased = 1 - Math.pow(1 - progress, 2);
      progressFill.style.width = `${eased * 100}%`;

      const count = Math.floor(eased * targetCount);
      progressCount.textContent = count.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        progressCount.textContent = targetCount.toLocaleString();
        resolve();
      }
    }
    requestAnimationFrame(tick);
  });
}

/* ========== COUNTDOWN PHASE ========== */
function runCountdown() {
  showScreen('countdown');
  const numbers = [4, 3, 2, 1, 0];
  let i = 0;

  return new Promise(resolve => {
    function showNext() {
      if (i >= numbers.length) {
        resolve();
        return;
      }
      const num = numbers[i];
      countdownNum.textContent = num;
      countdownNum.style.animation = 'none';
      void countdownNum.offsetHeight;
      countdownNum.style.animation = 'countBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both';

      if (num > 0) {
        playBeep(440 + num * 60, 0.12);
      } else {
        playBeep(880, 0.25);
      }

      i++;
      setTimeout(showNext, 1000);
    }
    showNext();
  });
}

/* ========== ROULETTE PHASE ========== */
function runRoulette(finalWinners) {
  showScreen('roulette');

  const poolSize = 40;
  const items = [];
  for (let i = 0; i < poolSize; i++) {
    const randomName = usernames[Math.floor(Math.random() * usernames.length)];
    items.push(randomName);
  }
  // put the actual winner near the end
  const winnerIndex = poolSize - 5;
  items[winnerIndex] = finalWinners[0];
  items[winnerIndex + 1] = finalWinners[0];
  items[winnerIndex + 2] = finalWinners[0];

  // render items
  rouletteTrack.innerHTML = '';
  items.forEach(name => {
    const div = document.createElement('div');
    div.className = 'roulette-track-item';
    div.textContent = name;
    rouletteTrack.appendChild(div);
  });

  const itemHeight = 70;
  const totalHeight = items.length * itemHeight;

  // initial position
  const startOffset = 0;
  const endOffset = winnerIndex * itemHeight;
  const extraLoops = 3 * items.length * itemHeight;
  const totalDistance = extraLoops + endOffset;

  const duration = 3000;
  const startTime = performance.now();

  return new Promise(resolve => {
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // cubic ease-out for realistic deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentOffset = eased * totalDistance;

      rouletteTrack.style.transform = `translateY(${-currentOffset}px)`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        rouletteTrack.style.transform = `translateY(${-endOffset}px)`;
        setTimeout(resolve, 400);
      }
    }
    requestAnimationFrame(tick);
  });
}

/* ========== TROPHY SVG ========== */
function trophySVG(position) {
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32', '#d31c92', '#6B4EFF'];
  const color = colors[position] || '#d31c92';
  const isCup = position < 3;
  if (isCup) {
    return `<svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <path d="M16 14H14C12.9 14 12 14.9 12 16V18C12 20.2 13.8 22 16 22H16.5M32 14H34C35.1 14 36 14.9 36 16V18C36 20.2 34.2 22 32 22H31.5M24 14V22M20 30H28L26 26H22L20 30ZM24 22V26" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M16 22C16 26 20 30 24 30C28 30 32 26 32 22" stroke="${color}" stroke-width="1.5" fill="none"/>
      <path d="M20 36H28" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 30V36" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
  }
  return `<svg width="22" height="22" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" stroke="${color}" stroke-width="2" fill="none"/>
    <path d="M18 22L22 26L30 18" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </svg>`;
}

/* ========== RESULTS PHASE ========== */
function runResults(finalWinners) {
  showScreen('results');
  winnersList.innerHTML = '';

  const labels = ['1er puesto', '2do puesto', '3er puesto', '4to puesto', '5to puesto'];

  finalWinners.forEach((name, i) => {
    const isPlaceholder = (name === 'xxx');
    let cls = '';
    if (i === 0 && !isPlaceholder) cls = 'gold';
    else if (i === 1 && !isPlaceholder) cls = 'silver';
    else if (i === 2 && !isPlaceholder) cls = 'bronze';
    else cls = 'placeholder';

    const card = document.createElement('div');
    card.className = `winner-card ${cls}`;
    card.innerHTML = `
      <div class="winner-badge">${trophySVG(i)}</div>
      <div class="winner-name">${name}</div>
      <div class="winner-label">${labels[i]}</div>
    `;
    winnersList.appendChild(card);
  });

  startConfetti();
}

/* ========== SOUND ========== */
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playBeep(freq, duration) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (_) {}
}

/* ========== CONFETTI ========== */
let confettiAnimId = null;
let confettiPieces = [];

function startConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  const W = confettiCanvas.width = confettiCanvas.parentElement.offsetWidth;
  const H = confettiCanvas.height = confettiCanvas.parentElement.offsetHeight;

  const colors = ['#d31c92', '#6B4EFF', '#FF007B', '#ffd700', '#00e5ff', '#76ff03', '#ff6d00'];
  confettiPieces = [];

  for (let i = 0; i < 180; i++) {
    confettiPieces.push({
      x: Math.random() * W,
      y: Math.random() * H - H,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 3 + 2,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 6,
      opacity: 1,
    });
  }

  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

  function tick() {
    ctx.clearRect(0, 0, W, H);
    let alive = false;
    for (const p of confettiPieces) {
      p.x += p.vx;
      p.vy += 0.04;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      p.vx *= 0.99;

      if (p.y > H + 20) {
        p.opacity -= 0.02;
      }

      if (p.opacity <= 0) continue;
      alive = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (alive) {
      confettiAnimId = requestAnimationFrame(tick);
    }
  }
  tick();

  // cleanup after 8s
  setTimeout(() => {
    if (confettiAnimId) {
      cancelAnimationFrame(confettiAnimId);
      confettiAnimId = null;
    }
    ctx.clearRect(0, 0, W, H);
  }, 8000);
}

/* ========== MAIN DRAW FLOW ========== */
async function handleDraw() {
  if (isRunning) return;
  isRunning = true;
  btnDraw.disabled = true;
  btnDraw.style.opacity = '0.6';

  const count = parseInt(winnerCount.value, 10);

  // preselect winners
  winners = pickWinners(count);

  try {
    await runLoading();
    await runCountdown();
    await runRoulette(winners);
    runResults(winners);
  } catch (_) {}

  isRunning = false;
  btnDraw.disabled = false;
  btnDraw.style.opacity = '1';
}

/* ========== RESET ========== */
function resetApp() {
  if (confettiAnimId) {
    cancelAnimationFrame(confettiAnimId);
    confettiAnimId = null;
  }
  const ctx = confettiCanvas.getContext('2d');
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  winners = [];
  isRunning = false;
  btnDraw.disabled = false;
  btnDraw.style.opacity = '1';
  showScreen('setup');
  postUrl.value = '';
  progressFill.style.width = '0%';
  progressCount.textContent = '0';
  rouletteTrack.innerHTML = '';
  rouletteTrack.style.transform = 'translateY(0)';
}

/* ========== EVENTS ========== */
btnDraw.addEventListener('click', handleDraw);
btnReset.addEventListener('click', resetApp);

// Enter key triggers draw
postUrl.addEventListener('keydown', e => {
  if (e.key === 'Enter') handleDraw();
});

/* ========== SETUP INITIAL STATE ========== */
showScreen('setup');
