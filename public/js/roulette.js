(function () {
  const cfg = window.__ROULETTE__;
  const slot = document.getElementById('slot');
  const list = document.getElementById('slot-list');
  const btn = document.getElementById('spin-btn');
  if (!cfg || !slot || !list || !btn) return;

  const ITEM_HEIGHT = 96;
  const REPEAT = 12;

  // build looped DOM
  const original = list.innerHTML;
  let html = '';
  for (let i = 0; i < REPEAT; i++) html += original;
  list.innerHTML = html;

  const totalItems = cfg.prizes.length;

  // start position roughly centered on first item visible
  list.style.transform = 'translateY(0px)';

  let spinning = false;

  function findPrizeIndex(prize) {
    return cfg.prizes.findIndex(function (p) {
      return p.name === prize.name && Boolean(p.isMaster) === Boolean(prize.isMaster);
    });
  }

  async function spin() {
    if (spinning) return;
    spinning = true;
    btn.disabled = true;
    btn.textContent = 'GIRANDO...';

    let prize;
    try {
      const resp = await fetch('/game/spin/' + cfg.playerId, { method: 'POST' });
      if (!resp.ok) throw new Error('falha');
      const data = await resp.json();
      prize = data.prize;
    } catch (err) {
      alert('Erro ao girar. Tente novamente.');
      btn.disabled = false;
      btn.textContent = 'GIRAR A ROLETA';
      spinning = false;
      return;
    }

    const idx = findPrizeIndex(prize);
    if (idx < 0) {
      window.location.href = '/game/result/' + cfg.playerId;
      return;
    }

    // we want the prize centered in the viewport.
    // viewport center is at slotHeight/2; each item is ITEM_HEIGHT tall.
    // an item at index k has top = k*ITEM_HEIGHT and center at k*ITEM_HEIGHT + ITEM_HEIGHT/2.
    // for it to align with viewport center we need translateY = -(k*ITEM_HEIGHT + ITEM_HEIGHT/2 - slotHeight/2)
    // since slotHeight === ITEM_HEIGHT, that simplifies to -(k*ITEM_HEIGHT)

    const fullCycles = 8;
    const finalIndex = fullCycles * totalItems + idx;
    const targetY = -(finalIndex * ITEM_HEIGHT);

    list.style.transition = 'transform 5s cubic-bezier(0.15, 0.8, 0.2, 1)';
    list.style.transform = 'translateY(' + targetY + 'px)';

    setTimeout(function () {
      window.location.href = '/game/result/' + cfg.playerId;
    }, 5300);
  }

  btn.addEventListener('click', function () {
    if (cfg.alreadySpun) {
      window.location.href = '/game/result/' + cfg.playerId;
      return;
    }
    spin();
  });
})();
