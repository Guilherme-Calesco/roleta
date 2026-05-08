(function () {
  const cfg = window.__FINAL__;
  if (!cfg) return;

  // weight bars animation
  const bars = document.querySelectorAll('.weight-bar-fill');
  const max = Array.from(bars).reduce(function (m, b) {
    return Math.max(m, Number(b.dataset.amount || 0));
  }, 0) || 1;
  setTimeout(function () {
    bars.forEach(function (b) {
      const v = Number(b.dataset.amount || 0);
      b.style.width = (v / max * 100).toFixed(2) + '%';
    });
  }, 100);

  const slot = document.getElementById('final-slot');
  const list = document.getElementById('final-slot-list');
  const btn = document.getElementById('final-spin-btn');
  const winnerBlock = document.getElementById('final-winner');
  const winnerName = document.getElementById('winner-name');
  const winnerAmount = document.getElementById('winner-amount');

  if (!slot || !list || !btn) return;
  if (cfg.players.length === 0) return;

  const ITEM_HEIGHT = 96;
  const REPEAT = 14;

  const original = list.innerHTML;
  let html = '';
  for (let i = 0; i < REPEAT; i++) html += original;
  list.innerHTML = html;

  list.style.transform = 'translateY(0px)';

  let spinning = false;

  btn.addEventListener('click', async function () {
    if (spinning) return;
    spinning = true;
    btn.disabled = true;
    btn.textContent = 'SORTEANDO...';
    winnerBlock.classList.add('hidden');

    let winner;
    try {
      const resp = await fetch('/admin/final/' + cfg.adminHash + '/spin', { method: 'POST' });
      if (!resp.ok) throw new Error('falha');
      const data = await resp.json();
      winner = data.winner;
    } catch (err) {
      alert('Erro ao sortear.');
      btn.disabled = false;
      btn.textContent = 'SORTEAR PRÊMIO MÁXIMO';
      spinning = false;
      return;
    }

    const idx = cfg.players.findIndex(function (p) { return p.id === winner.id; });
    if (idx < 0) {
      btn.disabled = false;
      btn.textContent = 'SORTEAR PRÊMIO MÁXIMO';
      spinning = false;
      return;
    }

    const totalItems = cfg.players.length;
    const fullCycles = 10;
    const finalIndex = fullCycles * totalItems + idx;
    const targetY = -(finalIndex * ITEM_HEIGHT);

    list.style.transition = 'transform 6s cubic-bezier(0.12, 0.8, 0.18, 1)';
    list.style.transform = 'translateY(' + targetY + 'px)';

    setTimeout(function () {
      winnerName.textContent = winner.name;
      winnerAmount.textContent = 'Contribuição: R$ ' +
        Number(winner.amountPaid).toFixed(2).replace('.', ',') +
        (winner.prize ? ' • Já havia ganho: ' + winner.prize : '');
      winnerBlock.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'SORTEAR NOVAMENTE';
      spinning = false;
    }, 6200);
  });
})();
