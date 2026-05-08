const express = require('express');
const crypto = require('crypto');
const { customAlphabet } = require('nanoid');

const Player = require('../models/Player');
const { buildPixPayload } = require('../services/pixService');
const { toDataURL } = require('../services/qrService');
const { pickPrize } = require('../services/rouletteService');
const prizesConfig = require('../config/prizes.json');

const router = express.Router();
const codeNanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

function makeRedemptionCode() {
  const raw = codeNanoid();
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

router.get('/', (req, res) => {
  res.render('name', { sessionName: req.session.playerName || '' });
});

router.post('/game/name', (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name || name.length < 2) {
    return res.redirect('/');
  }
  req.session.playerName = name.slice(0, 80);
  res.redirect('/game/value');
});

router.get('/game/value', (req, res) => {
  if (!req.session.playerName) return res.redirect('/');
  res.render('value', {
    playerName: req.session.playerName,
    sessionAmount: req.session.amount || ''
  });
});

router.post('/game/value', (req, res) => {
  if (!req.session.playerName) return res.redirect('/');
  const raw = String(req.body.amount || '').replace(/\./g, '').replace(',', '.');
  const amount = Number(raw);
  if (!isFinite(amount) || amount <= 0) {
    return res.redirect('/game/value');
  }
  req.session.amount = Math.round(amount * 100) / 100;
  res.redirect('/game/pix');
});

router.get('/game/pix', async (req, res, next) => {
  try {
    if (!req.session.playerName || !req.session.amount) return res.redirect('/');

    const payload = buildPixPayload({
      pixKey: process.env.PIX_KEY,
      receiverName: process.env.PIX_RECEIVER_NAME,
      receiverCity: process.env.PIX_RECEIVER_CITY,
      amount: req.session.amount,
      txid: '***'
    });
    const qrDataUrl = await toDataURL(payload);

    res.render('pix', {
      playerName: req.session.playerName,
      amount: req.session.amount,
      pixKey: process.env.PIX_KEY,
      pixPayload: payload,
      qrDataUrl,
      receiverName: process.env.PIX_RECEIVER_NAME
    });
  } catch (err) {
    next(err);
  }
});

router.post('/game/confirm', async (req, res, next) => {
  try {
    if (!req.session.playerName || !req.session.amount) {
      return res.status(400).json({ error: 'sessão inválida' });
    }
    const player = await Player.create({
      name: req.session.playerName,
      amountPaid: req.session.amount,
      pixConfirmed: true
    });
    req.session.playerId = String(player._id);
    res.json({ ok: true, playerId: player._id, redirect: `/game/roulette/${player._id}` });
  } catch (err) {
    next(err);
  }
});

router.get('/game/roulette/:id', async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).render('error', { message: 'Jogada não encontrada' });

    const prizes = [
      ...prizesConfig.regular.map((p) => ({ name: p.name, isMaster: false })),
      { name: prizesConfig.noPrize.name, isMaster: false, isEmpty: true },
      { name: prizesConfig.master.name, isMaster: true }
    ];

    res.render('roulette', {
      player,
      prizes,
      alreadySpun: Boolean(player.prize)
    });
  } catch (err) {
    next(err);
  }
});

router.post('/game/spin/:id', async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: 'jogada não encontrada' });
    if (!player.pixConfirmed) return res.status(400).json({ error: 'PIX não confirmado' });

    if (player.prize) {
      return res.json({
        prize: player.prize,
        voucherHash: player.voucherHash,
        redemptionCode: player.redemptionCode
      });
    }

    const prize = await pickPrize();
    player.prize = prize;
    player.voucherHash = crypto.randomUUID().replace(/-/g, '');
    player.redemptionCode = makeRedemptionCode();
    player.spunAt = new Date();
    await player.save();

    res.json({
      prize,
      voucherHash: player.voucherHash,
      redemptionCode: player.redemptionCode
    });
  } catch (err) {
    next(err);
  }
});

router.get('/game/result/:id', async (req, res, next) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player || !player.prize) {
      return res.status(404).render('error', { message: 'Resultado não encontrado' });
    }
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const voucherUrl = `${baseUrl}/voucher/${player.voucherHash}`;
    const qrDataUrl = await toDataURL(voucherUrl, { width: 280 });

    res.render('result', {
      player,
      voucherUrl,
      qrDataUrl
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
