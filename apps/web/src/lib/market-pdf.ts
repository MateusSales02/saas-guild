import { formatAge, formatSilver, getItemIconUrl, type CityPriceRow, type MarketSummary } from '@/lib/market'

export interface MarketReport {
  itemId: string
  itemName: string
  qualityLabel: string
  regionLabel: string
  quality: number
  rows: CityPriceRow[]
  summary: MarketSummary
  latestDate: (row: CityPriceRow) => string
}

async function loadImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve('')
      ctx.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve('')
    img.src = url
  })
}

/** Gera e baixa o relatório em PDF. O jsPDF é carregado sob demanda. */
export async function downloadMarketReport(report: MarketReport): Promise<void> {
  const { default: jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let y = margin

  const image = await loadImageAsBase64(getItemIconUrl(report.itemId, report.quality, 128))
  if (image) doc.addImage(image, 'PNG', margin, y, 28, 28)

  const textX = image ? margin + 34 : margin
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Relatório de Mercado - Albion Online', textX, y + 7)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`${report.itemName} (${report.itemId})`, textX, y + 15)
  doc.text(`Qualidade: ${report.qualityLabel} · Servidor: ${report.regionLabel}`, textX, y + 22)
  y += 38

  const s = report.summary
  doc.setFontSize(10)
  doc.text(`Comprar em: ${s.bestSell?.city ?? '-'} por ${formatSilver(s.bestSell?.sellMin)}`, margin, y)
  doc.text(`Vender em: ${s.bestBuy?.city ?? '-'} por ${formatSilver(s.bestBuy?.buyMax)}`, margin + 95, y)
  y += 6
  doc.text(`Média 30d: ${formatSilver(s.avg30d)}`, margin, y)
  if (s.flip) doc.text(`Flip ${s.flip.from} -> ${s.flip.to}: ${formatSilver(s.flip.profit)}`, margin + 95, y)
  y += 10

  const cols = [
    { label: 'Cidade', x: margin },
    { label: 'Venda mín.', x: margin + 45 },
    { label: 'Venda máx.', x: margin + 75 },
    { label: 'Compra máx.', x: margin + 105 },
    { label: 'Média 30d', x: margin + 135 },
    { label: 'Atualizado', x: margin + 162 },
  ]
  doc.setFillColor(30, 41, 59)
  doc.rect(margin - 2, y - 5, pageWidth - 2 * margin + 4, 8, 'F')
  doc.setTextColor(198, 169, 93)
  doc.setFont('helvetica', 'bold')
  cols.forEach((c) => doc.text(c.label, c.x, y))
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40, 40, 40)
  for (const row of report.rows) {
    if (y > pageHeight - 20) {
      doc.addPage()
      y = margin
    }
    doc.text(row.city, cols[0].x, y)
    doc.text(formatSilver(row.sellMin), cols[1].x, y)
    doc.text(formatSilver(row.sellMax), cols[2].x, y)
    doc.text(formatSilver(row.buyMax), cols[3].x, y)
    doc.text(formatSilver(row.avg30d), cols[4].x, y)
    doc.text(formatAge(report.latestDate(row)), cols[5].x, y)
    y += 7
  }

  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, margin, pageHeight - 10)
  doc.text('Powered by SaaS Guild', pageWidth - margin - 35, pageHeight - 10)

  doc.save(`mercado-albion-${report.itemId}-${new Date().toISOString().split('T')[0]}.pdf`)
}
