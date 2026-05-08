(function () {
  const btn = document.getElementById('confirm-btn');
  const countdownEl = document.getElementById('countdown');
  const countdownText = document.getElementById('countdown-text');
  const copyBtn = document.getElementById('copy-pix');

  let remaining = 30;
  countdownEl.textContent = remaining;

  const interval = setInterval(function () {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(interval);
      btn.disabled = false;
      countdownText.innerHTML = 'Pronto! Confirme seu pagamento abaixo.';
    } else {
      countdownEl.textContent = remaining;
    }
  }, 1000);

  if (copyBtn) {
    copyBtn.addEventListener('click', async function () {
      const text = copyBtn.dataset.pix;
      try {
        await navigator.clipboard.writeText(text);
        const original = copyBtn.textContent;
        copyBtn.textContent = 'Copiado!';
        setTimeout(function () { copyBtn.textContent = original; }, 1500);
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = 'Copiado!';
        setTimeout(function () { copyBtn.textContent = 'Copiar código'; }, 1500);
      }
    });
  }

  btn.addEventListener('click', async function () {
    btn.disabled = true;
    btn.textContent = 'Confirmando...';
    try {
      const resp = await fetch('/game/confirm', { method: 'POST' });
      const data = await resp.json();
      if (data && data.redirect) {
        window.location.href = data.redirect;
      } else {
        throw new Error('resposta inválida');
      }
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'CONFIRMAR PIX';
      alert('Erro ao confirmar. Tente novamente.');
    }
  });
})();
