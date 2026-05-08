(function () {
  const cfg = window.__ROULETTE__;
  const btn = document.getElementById('spin-btn');
  const lists = [
    document.getElementById('slot-list-0'),
    document.getElementById('slot-list-1'),
    document.getElementById('slot-list-2')
  ];
  if (!cfg || !btn || lists.some(function (l) { return !l; })) return;

  const ITEM_HEIGHT = 96;
  const REPEAT = 12;

  lists.forEach(function (list) {
    const original = list.innerHTML;
    let html = '';
    for (let i = 0; i < REPEAT; i++) html += original;
    list.innerHTML = html;
    list.style.transform = 'translateY(0px)';
  });

  const totalItems = cfg.prizes.length;
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

    const durations = [4.0, 4.6, 5.2];
    const baseCycles = [6, 7, 8];

    lists.forEach(function (list, i) {
      const finalIndex = baseCycles[i] * totalItems + idx;
      const targetY = -(finalIndex * ITEM_HEIGHT);
      list.style.transition =
        'transform ' + durations[i] + 's cubic-bezier(0.15, 0.8, 0.2, 1)';
      list.style.transform = 'translateY(' + targetY + 'px)';
    });

    setTimeout(function () {
      window.location.href = '/game/result/' + cfg.playerId;
    }, 5500);
  }

  btn.addEventListener('click', function () {
    if (cfg.alreadySpun) {
      window.location.href = '/game/result/' + cfg.playerId;
      return;
    }
    spin();
  });
})();
