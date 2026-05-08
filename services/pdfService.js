const PDFDocument = require('pdfkit');

const COLORS = {
  black: '#0A0A08',
  brownDark: '#402000',
  brown: '#604020',
  goldDark: '#806040',
  gold: '#A08060',
  champagne: '#C0A080',
  beige: '#D8C0A8',
  offwhite: '#F4F0E8'
};

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

  doc.rect(0, 0, pageW, pageH).fill(COLORS.offwhite);

  const margin = 36;
  doc
    .lineWidth(2)
    .strokeColor(COLORS.gold)
    .rect(margin, margin, pageW - margin * 2, pageH - margin * 2)
    .stroke();

  doc
    .lineWidth(0.5)
    .strokeColor(COLORS.champagne)
    .rect(margin + 8, margin + 8, pageW - margin * 2 - 16, pageH - margin * 2 - 16)
    .stroke();

  doc
    .fillColor(COLORS.goldDark)
    .font('Times-Italic')
    .fontSize(28)
    .text(coupleNames || 'Emillene & Caio', 0, margin + 50, {
      align: 'center',
      width: pageW
    });

  doc
    .fillColor(COLORS.brown)
    .font('Helvetica')
    .fontSize(11)
    .text(weddingDate ? `Casamento • ${weddingDate}` : 'Casamento', 0, margin + 90, {
      align: 'center',
      width: pageW
    });

  doc
    .moveTo(pageW / 2 - 60, margin + 115)
    .lineTo(pageW / 2 + 60, margin + 115)
    .strokeColor(COLORS.gold)
    .lineWidth(1)
    .stroke();

  doc
    .fillColor(COLORS.brownDark)
    .font('Times-Bold')
    .fontSize(22)
    .text('VOUCHER DE PRÊMIO', 0, margin + 140, {
      align: 'center',
      width: pageW
    });

  const prizeName = player.prize ? player.prize.name : 'Prêmio';
  const isMaster = player.prize && player.prize.isMaster;

  doc
    .fillColor(COLORS.brown)
    .font('Helvetica')
    .fontSize(12)
    .text('Prêmio sorteado', 0, margin + 210, { align: 'center', width: pageW });

  doc
    .fillColor(isMaster ? COLORS.brownDark : COLORS.goldDark)
    .font('Times-Bold')
    .fontSize(isMaster ? 30 : 24)
    .text(prizeName, margin + 30, margin + 235, {
      align: 'center',
      width: pageW - (margin + 30) * 2
    });

  if (isMaster) {
    doc
      .fillColor(COLORS.brownDark)
      .font('Times-Italic')
      .fontSize(13)
      .text('★ Prêmio Master ★', 0, margin + 280, { align: 'center', width: pageW });
  }

  const detailsY = margin + 330;
  const labelStyle = () => doc.fillColor(COLORS.brown).font('Helvetica').fontSize(10);
  const valueStyle = () => doc.fillColor(COLORS.black).font('Helvetica-Bold').fontSize(13);

  labelStyle().text('CONVIDADO(A)', margin + 60, detailsY, {
    width: pageW - margin * 2 - 120
  });
  valueStyle().text(player.name, margin + 60, detailsY + 14, {
    width: pageW - margin * 2 - 120
  });

  labelStyle().text('DATA DO SORTEIO', margin + 60, detailsY + 50, {
    width: pageW - margin * 2 - 120
  });
  valueStyle().text(formatDate(player.spunAt || player.createdAt), margin + 60, detailsY + 64, {
    width: pageW - margin * 2 - 120
  });

  labelStyle().text('CÓDIGO DE RESGATE', margin + 60, detailsY + 100, {
    width: pageW - margin * 2 - 120
  });
  doc
    .fillColor(COLORS.brownDark)
    .font('Courier-Bold')
    .fontSize(20)
    .text(player.redemptionCode || '----', margin + 60, detailsY + 116, {
      width: pageW - margin * 2 - 120
    });

  doc
    .moveTo(margin + 60, pageH - margin - 100)
    .lineTo(pageW - margin - 60, pageH - margin - 100)
    .strokeColor(COLORS.champagne)
    .lineWidth(0.5)
    .stroke();

  doc
    .fillColor(COLORS.brown)
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
      .fillColor(COLORS.goldDark)
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
    .fillColor(COLORS.goldDark)
    .font('Times-Italic')
    .fontSize(10)
    .text('Com amor,', 0, pageH - margin - 38, { align: 'center', width: pageW });
  doc
    .fillColor(COLORS.brownDark)
    .font('Times-Italic')
    .fontSize(13)
    .text(coupleNames || 'Emillene & Caio', 0, pageH - margin - 24, {
      align: 'center',
      width: pageW
    });

  doc.end();
}

module.exports = { streamVoucher };
