require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');

const { connectDB } = require('./config/db');
const gameRoutes = require('./routes/game');
const voucherRoutes = require('./routes/voucher');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'casamento-emillene-caio-dev',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 4
    }
  })
);

app.use(function (req, res, next) {
  res.locals.coupleNames = process.env.COUPLE_NAMES || 'Emillene & Caio';
  res.locals.weddingDate = process.env.WEDDING_DATE || '';
  res.locals.weddingHashtag = process.env.WEDDING_HASHTAG || '';
  next();
});

app.use('/', gameRoutes);
app.use('/', voucherRoutes);
app.use('/', adminRoutes);

app.use(function (req, res) {
  res.status(404).render('error', { message: 'Página não encontrada' });
});

app.use(function (err, req, res, _next) {
  console.error('[error]', err);
  res.status(500).render('error', { message: 'Algo deu errado. Tente novamente.' });
});

(async function start() {
  try {
    await connectDB();
    app.listen(PORT, function () {
      console.log(`[server] rodando em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[server] falha ao iniciar:', err);
    process.exit(1);
  }
})();
