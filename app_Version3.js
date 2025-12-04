// Interactive typing test
(() => {
  const prompts = [
    "The quick brown fox jumps over the lazy dog.",
    "Pack my box with five dozen liquor jugs.",
    "Sphinx of black quartz, judge my vow.",
    "Typing tests measure speed and accuracy simultaneously.",
    "Practice makes improvement: steady practice beats short bursts.",
    "C is small, fast, and can serve HTML directly from strings.",
    "A smooth rhythm of keystrokes grows with focused practice."
  ];

  // UI
  const startBtn = document.getElementById('startBtn');
  const restartBtn = document.getElementById('restartBtn');
  const durationSel = document.getElementById('duration');
  const promptEl = document.getElementById('prompt');
  const inputEl = document.getElementById('input');
  const timeEl = document.getElementById('time');
  const wpmEl = document.getElementById('wpm');
  const accEl = document.getElementById('accuracy');
  const progressBar = document.getElementById('progressBar');
  const progressWrap = document.querySelector('.progress-wrap');

  const results = document.getElementById('results');
  const resElapsed = document.getElementById('resElapsed');
  const resWpm = document.getElementById('resWpm');
  const resAcc = document.getElementById('resAcc');
  const retryBtn = document.getElementById('retryBtn');
  const shareBtn = document.getElementById('shareBtn');
  const cheer = document.getElementById('cheer');

  let chosen = '';
  let startTime = 0;
  let timer = null;
  let duration = 60;
  let finished = false;

  function pickPrompt() {
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  function renderPrompt(text, typed = '') {
    // Create spans per char and add classes
    promptEl.innerHTML = '';
    const typedLen = typed.length;
    for (let i = 0; i < text.length; i++) {
      const ch = document.createElement('span');
      ch.className = 'char';
      ch.textContent = text[i];
      if (i < typedLen) {
        if (typed[i] === text[i]) ch.classList.add('correct');
        else ch.classList.add('incorrect');
      } else if (i === typedLen && !finished) {
        ch.classList.add('next');
      }
      promptEl.appendChild(ch);
    }
  }

  function calcMetrics(typed, target, elapsedSec) {
    const tlen = typed.length;
    const plen = target.length;
    const minlen = Math.min(tlen, plen);
    let correct = 0;
    for (let i = 0; i < minlen; i++) if (typed[i] === target[i]) correct++;
    // extras considered incorrect
    const minutes = Math.max(elapsedSec / 60, 1/60);
    const wpm = Math.round((correct / 5) / minutes);
    const accuracy = tlen > 0 ? (correct / tlen) * 100 : 100;
    return {correct, wpm, accuracy};
  }

  function updateStats() {
    const elapsed = (Date.now() - startTime) / 1000;
    const typed = inputEl.value;
    const {wpm, accuracy} = calcMetrics(typed, chosen, elapsed);
    timeEl.textContent = elapsed.toFixed(2);
    wpmEl.textContent = wpm;
    accEl.textContent = accuracy.toFixed(1) + '%';

    // progress
    const remaining = Math.max(0, duration - elapsed);
    const pct = Math.min(100, (elapsed / duration) * 100);
    progressBar.style.width = pct + '%';
    return elapsed;
  }

  function finishTest(auto=false) {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    inputEl.disabled = true;
    inputEl.setAttribute('aria-disabled','true');
    restartBtn.hidden = false;
    startBtn.hidden = true;
    progressWrap.hidden = true;

    const elapsed = (Date.now() - startTime) / 1000;
    const typed = inputEl.value;
    const {correct, wpm, accuracy} = calcMetrics(typed, chosen, elapsed);
    // show results
    resElapsed.textContent = elapsed.toFixed(2) + ' s';
    resWpm.textContent = wpm;
    resAcc.textContent = accuracy.toFixed(1) + '%';
    results.hidden = false;
    // small celebration for good scores
    if (wpm >= 50 && accuracy >= 90) {
      cheer.classList.add('visible');
      cheer.setAttribute('aria-hidden','false');
    } else {
      cheer.classList.remove('visible');
      cheer.setAttribute('aria-hidden','true');
    }
  }

  function startTest() {
    // reset
    results.hidden = true;
    cheer.classList.remove('visible');
    restartBtn.hidden = true;
    startBtn.hidden = true;
    inputEl.value = '';
    finished = false;

    duration = parseInt(durationSel.value, 10) || 60;
    chosen = pickPrompt();
    renderPrompt(chosen, '');
    inputEl.disabled = false;
    inputEl.removeAttribute('aria-disabled');
    inputEl.focus();

    startTime = Date.now();
    progressWrap.hidden = false;
    progressBar.style.width = '0%';
    timeEl.textContent = '0.00';
    wpmEl.textContent = '0';
    accEl.textContent = '100%';

    timer = setInterval(() => {
      const elapsed = updateStats();
      if (elapsed >= duration) finishTest(true);
    }, 100);
  }

  // Event handlers
  startBtn.addEventListener('click', (e) => { e.preventDefault(); startTest(); });
  restartBtn.addEventListener('click', (e) => { e.preventDefault(); startBtn.hidden=false; restartBtn.hidden=true; });
  retryBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // restart fresh
    results.hidden = true;
    startBtn.hidden = false;
    restartBtn.hidden = true;
    cheer.classList.remove('visible');
    inputEl.value = '';
    inputEl.disabled = true;
    inputEl.setAttribute('aria-disabled','true');
    promptEl.innerHTML = '';
  });

  shareBtn.addEventListener('click', async () => {
    const text = `${resWpm.textContent} WPM • ${resAcc.textContent} accuracy • ${resElapsed.textContent} — Merilles Typing Test`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try { await navigator.clipboard.writeText(text); alert('Score copied to clipboard!'); }
      catch(_) { prompt('Copy your score', text); }
    } else {
      prompt('Copy your score', text);
    }
  });

  // live typing logic
  inputEl.addEventListener('input', () => {
    if (!startTime) return;
    const typed = inputEl.value;
    renderPrompt(chosen, typed);
    const elapsed = updateStats();
    // If user finishes typing whole prompt, end early
    if (typed.length >= chosen.length) finishTest(false);
  });

  // keyboard shortcut: ctrl+enter to finish early
  inputEl.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      finishTest(false);
    }
  });

  // Allow space/enter on page to start if input disabled
  document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.key === 'Enter') && inputEl.disabled && document.activeElement === document.body) {
      e.preventDefault();
      startBtn.click();
    }
  });

  // initial render
  promptEl.textContent = 'Press \"Start Test\" to begin — match punctuation and capitalization for best accuracy.';
})();