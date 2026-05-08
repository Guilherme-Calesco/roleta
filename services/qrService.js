const QRCode = require('qrcode');

async function toDataURL(text, opts = {}) {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320,
    color: { dark: '#402000', light: '#F4F0E8' },
    ...opts
  });
}

module.exports = { toDataURL };
