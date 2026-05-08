function emvField(id, value) {
  const len = String(value.length).padStart(2, '0');
  return `${id}${len}${value}`;
}

function crc16ccitt(payload) {
  let crc = 0xffff;
  const polynomial = 0x1021;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ polynomial) : (crc << 1);
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function sanitize(text, maxLen) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .slice(0, maxLen)
    .trim();
}

function buildPixPayload({ pixKey, receiverName, receiverCity, amount, txid = '***' }) {
  if (!pixKey) throw new Error('PIX_KEY não configurado');
  const merchantAccount =
    emvField('00', 'br.gov.bcb.pix') +
    emvField('01', pixKey);

  const additionalData = emvField('05', txid || '***');

  const amountStr = Number(amount).toFixed(2);

  let payload =
    emvField('00', '01') +
    emvField('26', merchantAccount) +
    emvField('52', '0000') +
    emvField('53', '986') +
    emvField('54', amountStr) +
    emvField('58', 'BR') +
    emvField('59', sanitize(receiverName, 25) || 'NOME') +
    emvField('60', sanitize(receiverCity, 15) || 'CIDADE') +
    emvField('62', additionalData);

  payload += '6304';
  const crc = crc16ccitt(payload);
  return payload + crc;
}

module.exports = { buildPixPayload };
