// Leaderboard panel + one-time player form. The server never returns emails.
import { $, el } from './ui.js';

const KEY = 'top-out-player';
const getPlayer = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
const setPlayer = (p) => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ } };

async function api(path, body) {
  const r = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Leaderboard unavailable.');
  return data;
}

export async function refresh() {
  const list = $('#lb-list');
  try {
    const { entries } = await api('/api/leaderboard');
    list.replaceChildren(...(entries.length ? entries.map((e) => el('li', {}, el('span', { class: 'mono' }, String(e.rank)), el('span', { class: 'lb-name' }, e.name), el('b', { class: 'mono' }, String(e.score)))) : [el('li', { class: 'muted' }, 'No scores yet. Be first.')]));
  } catch { list.replaceChildren(el('li', { class: 'muted' }, 'Leaderboard unavailable right now.')); }
}

async function send(token, score) {
  try { await api('/api/scores', { token, score }); refresh(); } catch { /* offline or no database: the game goes on */ }
}

// Called when a real run ends. Asks for name and email once, then saves the score.
export function submitScore(score) {
  if (score < 1) return;
  const p = getPlayer();
  if (p?.token) return send(p.token, score);
  const form = $('#player-form');
  form.hidden = false;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const msg = $('#pf-msg'); msg.textContent = '';
    try {
      const { token } = await api('/api/players', { firstName: f.get('first'), lastName: f.get('last'), email: f.get('email') });
      setPlayer({ token, name: `${f.get('first')} ${f.get('last')}` });
      form.hidden = true;
      send(token, score);
    } catch (err) { msg.textContent = err.message; }
  };
  $('#pf-skip').onclick = () => { form.hidden = true; };
}

export function initLeaderboard() {
  const panel = $('#lb');
  const toggle = (open) => { panel.classList.toggle('open', open); $('#lb-tab').setAttribute('aria-expanded', open); if (open) refresh(); };
  $('#lb-tab').addEventListener('click', () => toggle(!panel.classList.contains('open')));
  $('#lb-close').addEventListener('click', () => toggle(false));
}
