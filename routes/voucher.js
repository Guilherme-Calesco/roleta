const express = require('express');
const Player = require('../models/Player');
const { streamVoucher } = require('../services/pdfService');

const router = express.Router();

router.get('/voucher/:hash', async (req, res, next) => {
  try {
    const player = await Player.findOne({ voucherHash: req.params.hash });
    if (!player || !player.prize) {
      return res.status(404).render('error', { message: 'Voucher não encontrado' });
    }
    res.render('voucher', { player });
  } catch (err) {
    next(err);
  }
});

router.get('/voucher/:hash/pdf', async (req, res, next) => {
  try {
    const player = await Player.findOne({ voucherHash: req.params.hash });
    if (!player || !player.prize) {
      return res.status(404).render('error', { message: 'Voucher não encontrado' });
    }
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    streamVoucher(res, {
      player,
      coupleNames: process.env.COUPLE_NAMES || 'Emillene & Caio',
      weddingDate: process.env.WEDDING_DATE || '',
      baseUrl
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
