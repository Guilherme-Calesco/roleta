(function () {
  const input = document.getElementById('amount');
  if (!input) return;

  function format(raw) {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';
    const cents = digits.padStart(3, '0');
    const intPart = cents.slice(0, -2).replace(/^0+/, '') || '0';
    const decPart = cents.slice(-2);
    const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return intWithDots + ',' + decPart;
  }

  input.addEventListener('input', function (e) {
    const v = format(e.target.value);
    e.target.value = v;
  });

  if (input.value) input.value = format(input.value);
})();
