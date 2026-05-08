const express = require('express');
const Player = require('../models/Player');
const { pickFinalWinner } = require('../services/rouletteService');

const router = express.Router();

function checkHash(req, res, next) {
  const expected = process.env.ADMIN_HASH;
  if (!expected || req.params.adminHash !== expected) {
    return res.status(404).render('error', { message: 'Página não encontrada' });
  }
  next();
}

router.get('/admin/final/:adminHash', checkHash, async (req, res, next) => {
  try {
    const players = await Player.find({ pixConfirmed: true })
      .sort({ amountPaid: -1, createdAt: 1 })
      .lean();
    const total = players.reduce((s, p) => s + (p.amountPaid || 0), 0);
    res.render('final-roulette', {
      players,
      totalAccumulated: total,
      adminHash: req.params.adminHash
    });
  } catch (err) {
    next(err);
  }
});

router.post('/admin/final/:adminHash/spin', checkHash, async (req, res, next) => {
  try {
    const players = await Player.find({ pixConfirmed: true }).lean();
    const winner = pickFinalWinner(players);
    if (!winner) return res.status(400).json({ error: 'sem jogadores elegíveis' });

    await Player.updateMany(
      { finalRouletteWinner: true },
      { $set: { finalRouletteWinner: false } }
    );
    await Player.updateOne(
      { _id: winner._id },
      { $set: { finalRouletteWinner: true } }
    );

    res.json({
      winner: {
        id: String(winner._id),
        name: winner.name,
        amountPaid: winner.amountPaid,
        prize: winner.prize ? winner.prize.name : null
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
