const Player = require('../models/Player');
const prizesConfig = require('../config/prizes.json');

async function getTotalAccumulated() {
  const result = await Player.aggregate([
    { $match: { pixConfirmed: true } },
    { $group: { _id: null, total: { $sum: '$amountPaid' } } }
  ]);
  return result.length ? result[0].total : 0;
}

async function masterAlreadyAwarded() {
  const exists = await Player.exists({ 'prize.isMaster': true });
  return Boolean(exists);
}

async function pickPrize() {
  const threshold = Number(process.env.MASTER_THRESHOLD || 500);
  const mode = (process.env.MASTER_AWARD_MODE || 'once').toLowerCase();
  const chancePercent = Number(process.env.MASTER_CHANCE_PERCENT || 10);

  const total = await getTotalAccumulated();
  const masterUnlocked = total >= threshold;

  if (masterUnlocked) {
    const already = await masterAlreadyAwarded();
    if (!already) {
      if (mode === 'once') {
        return { name: prizesConfig.master.name, isMaster: true };
      } else if (mode === 'chance') {
        if (Math.random() * 100 < chancePercent) {
          return { name: prizesConfig.master.name, isMaster: true };
        }
      }
    }
  }

  const noPrizePercent = Number(process.env.NO_PRIZE_PERCENT || 30);
  if (Math.random() * 100 < noPrizePercent) {
    return { name: prizesConfig.noPrize.name, isMaster: false, isEmpty: true };
  }

  const regulars = prizesConfig.regular;
  const idx = Math.floor(Math.random() * regulars.length);
  return { name: regulars[idx].name, isMaster: false };
}

function pickFinalWinner(players) {
  const eligible = players.filter((p) => p.amountPaid > 0);
  if (eligible.length === 0) return null;
  const total = eligible.reduce((s, p) => s + p.amountPaid, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (const p of eligible) {
    acc += p.amountPaid;
    if (r <= acc) return p;
  }
  return eligible[eligible.length - 1];
}

module.exports = { pickPrize, pickFinalWinner, getTotalAccumulated };
