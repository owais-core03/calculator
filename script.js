let expr = '', justEvaled = false;
const exprEl = document.getElementById('expr');
const resEl  = document.getElementById('result-display');
const histEl = document.getElementById('history');
const history = [];

function safeEval(e) {
  try {
    const r = Function('"use strict";return(' + e.replace(/%/g, '/ 100') + ')')();
    return isFinite(r) ? parseFloat(r.toFixed(10)) : null;
  } catch { return null; }
}

function formatNum(n) {
  const s = String(n);
  if (s.includes('e')) return n.toExponential(4);
  const parts = s.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function updateDisplay() {
  resEl.classList.remove('error', 'fresh');
  if (justEvaled) return;
  exprEl.textContent = expr.replace(/\*/g, '×').replace(/\//g, '÷');
  if (!expr) { resEl.textContent = '0'; return; }
  const r = safeEval(expr);
  resEl.textContent = r !== null ? formatNum(r) : '';
}

function pressKey(btn) {
  const a = btn.dataset.action;
  const v = btn.dataset.val;

  if (a === 'clear') {
    expr = ''; justEvaled = false;
    resEl.classList.remove('error', 'fresh');
    resEl.textContent = '0';
    exprEl.textContent = '';
    return;
  }
  if (a === 'del') {
    if (justEvaled) { expr = ''; justEvaled = false; }
    else { expr = expr.slice(0, -1); }
    updateDisplay(); return;
  }
  if (a === 'eq') {
    if (!expr) return;
    const r = safeEval(expr);
    if (r === null) {
      resEl.classList.add('error');
      resEl.textContent = 'Error';
      exprEl.textContent = expr.replace(/\*/g, '×').replace(/\//g, '÷');
      expr = ''; justEvaled = false;
    } else {
      exprEl.textContent = expr.replace(/\*/g, '×').replace(/\//g, '÷') + ' =';
      resEl.textContent  = formatNum(r);
      resEl.classList.add('fresh');
      if (history.length >= 4) history.shift();
      history.push({ display: formatNum(r), result: String(r) });
      renderHistory();
      expr = String(r); justEvaled = true;
    }
    return;
  }
  if (v !== undefined) {
    if (justEvaled && /[0-9(.]/.test(v)) { expr = ''; }
    justEvaled = false;
    const ops = ['+', '-', '*', '/', '%'];
    if (ops.includes(v) && ops.includes(expr.slice(-1)) && v !== '-') { expr = expr.slice(0, -1); }
    expr += v;
    updateDisplay();
  }
}

function renderHistory() {
  histEl.innerHTML = '';
  [...history].reverse().forEach(h => {
    const pill = document.createElement('button');
    pill.className = 'hist-pill';
    pill.title = h.display;
    pill.textContent = h.display;
    pill.addEventListener('click', () => {
      if (justEvaled) { expr = ''; }
      justEvaled = false;
      expr += h.result;
      updateDisplay();
    });
    histEl.appendChild(pill);
  });
}

document.getElementById('keys').addEventListener('click', e => {
  const b = e.target.closest('.key');
  if (b) pressKey(b);
});

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const map = {
    'Enter':'eq','=':'eq','Backspace':'del','Escape':'clear',
    '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
    '.':'.', '+':'+', '-':'-', '*':'*', '/':'/', '%':'%', '(':'(', ')':')'
  };
  const mapped = map[e.key];
  if (!mapped) return;
  e.preventDefault();
  const isAction = ['eq','del','clear'].includes(mapped);
  pressKey({ dataset: isAction ? { action: mapped } : { val: mapped } });
  const btn = [...document.querySelectorAll('.key')].find(b =>
    (isAction && b.dataset.action === mapped) || (!isAction && b.dataset.val === mapped)
  );
  if (btn) { btn.style.transform = 'scale(0.91)'; setTimeout(() => btn.style.transform = '', 100); }
});
