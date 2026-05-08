const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const COLORS = {
  bg: '#FFFFFF',
  bgSoft: '#F7F8F4',
  primary: '#9AAA8E',
  primaryDark: '#748366',
  primaryLight: '#DCE3D4',
  text: '#3F443B',
  textMuted: '#8A8F82',
  border: '#E5E9DF',
  warning: '#C8B47B'
};

const LOGO_PATH = path.join(__dirname, '..', 'public', 'logo.png');
const RAMOS_PATH = path.join(__dirname, '..', 'public', 'ramos.png');

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

function streamVoucher(res, { player, coupleNames, weddingDate, baseUrl }) {
  const doc = new PDFDocument({ size: 'A4', margin: 0 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="voucher-${player.redemptionCode || 'casamento'}.pdf"`
  );
  doc.pipe(res);

  const pageW = doc.page.width;
  const pageH = doc.page.height;

  doc.rect(0, 0, pageW, pageH).fill(COLORS.bg);

  const margin = 36;
  doc
    .lineWidth(1)
    .strokeColor(COLORS.border)
    .rect(margin, margin, pageW - margin * 2, pageH - margin * 2)
    .stroke();

  let y = margin + 28;

  // Logo
  if (fs.existsSync(LOGO_PATH)) {
    const logoW = 110;
    doc.image(LOGO_PATH, (pageW - logoW) / 2, y, { width: logoW });
    y += 110;
  } else {
    y += 20;
  }

  // Ramos top
  if (fs.existsSync(RAMOS_PATH)) {
    const ramosW = 200;
    doc.image(RAMOS_PATH, (pageW - ramosW) / 2, y, { width: ramosW });
    y += 110;
  } else {
    y += 20;
  }

  // Couple names
  doc
    .fillColor(COLORS.primaryDark)
    .font('Times-Italic')
    .fontSize(26)
    .text(coupleNames || 'Emillene & Caio', 0, y, {
      align: 'center',
      width: pageW
    });
  y += 36;

  // Date
  doc
    .fillColor(COLORS.textMuted)
    .font('Helvetica')
    .fontSize(10)
    .text(weddingDate ? `Casamento • ${weddingDate}` : 'Casamento', 0, y, {
      align: 'center',
      width: pageW,
      characterSpacing: 2
    });
  y += 28;

  // Title
  doc
    .fillColor(COLORS.primaryDark)
    .font('Times-Bold')
    .fontSize(18)
    .text('VOUCHER DE PRÊMIO', 0, y, {
      align: 'center',
      width: pageW,
      characterSpacing: 4
    });
  y += 32;

  // Prize section
  const prizeName = player.prize ? player.prize.name : 'Prêmio';
  const isMaster = player.prize && player.prize.isMaster;

  doc
    .fillColor(COLORS.primary)
    .font('Helvetica')
    .fontSize(10)
    .text('PRÊMIO SORTEADO', 0, y, {
      align: 'center',
      width: pageW,
      characterSpacing: 3
    });
  y += 18;

  doc
    .fillColor(isMaster ? COLORS.warning : COLORS.text)
    .font(isMaster ? 'Times-Italic' : 'Times-Bold')
    .fontSize(isMaster ? 28 : 22)
    .text(prizeName, margin + 30, y, {
      align: 'center',
      width: pageW - (margin + 30) * 2
    });
  y += isMaster ? 40 : 32;

  if (isMaster) {
    doc
      .fillColor(COLORS.warning)
      .font('Times-Italic')
      .fontSize(13)
      .text('★ Prêmio Master ★', 0, y, {
        align: 'center',
        width: pageW
      });
    y += 22;
  }

  y += 14;

  // Details
  const detailLeftX = margin + 60;
  const detailWidth = pageW - margin * 2 - 120;

  const labelStyle = () =>
    doc.fillColor(COLORS.primary).font('Helvetica').fontSize(9);
  const valueStyle = () =>
    doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(13);

  labelStyle().text('CONVIDADO(A)', detailLeftX, y, {
    width: detailWidth,
    characterSpacing: 2
  });
  y += 13;
  valueStyle().text(player.name, detailLeftX, y, { width: detailWidth });
  y += 28;

  labelStyle().text('DATA DO SORTEIO', detailLeftX, y, {
    width: detailWidth,
    characterSpacing: 2
  });
  y += 13;
  valueStyle().text(
    formatDate(player.spunAt || player.createdAt),
    detailLeftX,
    y,
    { width: detailWidth }
  );
  y += 28;

  labelStyle().text('CÓDIGO DE RESGATE', detailLeftX, y, {
    width: detailWidth,
    characterSpacing: 2
  });
  y += 13;
  doc
    .fillColor(COLORS.primaryDark)
    .font('Courier-Bold')
    .fontSize(20)
    .text(player.redemptionCode || '----', detailLeftX, y, {
      width: detailWidth,
      characterSpacing: 3
    });
  y += 30;

  // Ramos bottom (decorative)
  if (fs.existsSync(RAMOS_PATH)) {
    const ramosBottomW = 180;
    const ramosBottomY = pageH - margin - 150;
    doc.image(RAMOS_PATH, (pageW - ramosBottomW) / 2, ramosBottomY, {
      width: ramosBottomW
    });
  }

  // Footer instructions
  doc
    .fillColor(COLORS.textMuted)
    .font('Helvetica')
    .fontSize(9)
    .text(
      'Apresente este voucher aos noivos para resgatar seu prêmio.',
      margin,
      pageH - margin - 80,
      { align: 'center', width: pageW - margin * 2 }
    );

  if (baseUrl && player.voucherHash) {
    doc
      .fillColor(COLORS.primary)
      .font('Helvetica-Oblique')
      .fontSize(8)
      .text(
        `${baseUrl}/voucher/${player.voucherHash}`,
        margin,
        pageH - margin - 60,
        { align: 'center', width: pageW - margin * 2 }
      );
  }

  doc
    .fillColor(COLORS.textMuted)
    .font('Times-Italic')
    .fontSize(10)
    .text('Com amor,', 0, pageH - margin - 38, {
      align: 'center',
      width: pageW
    });
  doc
    .fillColor(COLORS.primaryDark)
    .font('Times-Italic')
    .fontSize(13)
    .text(coupleNames || 'Emillene & Caio', 0, pageH - margin - 24, {
      align: 'center',
      width: pageW
    });

  doc.end();
}

module.exports = { streamVoucher };
