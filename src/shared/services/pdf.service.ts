import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
const PDFDocument = require('pdfkit');

@Injectable()
export class PdfGeneratorService {
  private readonly outputDir = path.join(process.cwd(), 'uploads');
  private readonly fontRegular = path.join(
    process.cwd(),
    'fonts',
    'Roboto-Regular.ttf',
  );
  private readonly fontBold = path.join(
    process.cwd(),
    'fonts',
    'Roboto-Bold.ttf',
  );

  constructor() {
    this.ensureOutputDirectoryExists();
  }

  private ensureOutputDirectoryExists(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  public async generateRiskReport(
    userId: number,
    userData: {
      age?: number;
      height?: number;
      weight?: number;
      diseases?: string[];
    },
    riskData: {
      risk_score: number;
      risk_factors: Array<{ source: string; label: string; weight: number }>;
    },
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // 1) Create document with A4 and margins
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 72, bottom: 72, left: 72, right: 72 },
        });

        // 2) Register fonts
        [this.fontRegular, this.fontBold].forEach((fp, i) => {
          if (!fs.existsSync(fp)) throw new Error(`Font not found: ${fp}`);
          doc.registerFont(i === 0 ? 'Regular' : 'Bold', fp);
        });
        doc.font('Regular');

        // 3) Pipe to file
        const filename = `medical_report_${userId}_${Date.now()}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // ── HEADER ─────────────────────────────────────────────────────────
        doc.fillColor('#2C3E50').rect(0, 0, doc.page.width, 80).fill();

        doc
          .fillColor('#FFFFFF')
          .font('Bold')
          .fontSize(20)
          .text('SPARK HEALTH', 72, 24, { align: 'left' });

        doc
          .fillColor('#FFFFFF')
          .font('Bold')
          .fontSize(18)
          .text('Медицинский отчёт о рисках', 0, 28, { align: 'center' });

        doc
          .font('Regular')
          .fontSize(10)
          .text('Конфиденциальный документ', 0, 50, { align: 'center' });

        doc
          .moveTo(72, 82)
          .lineTo(doc.page.width - 72, 82)
          .strokeColor('#3498DB')
          .lineWidth(2)
          .stroke();

        doc.moveDown(4);
        // ── END HEADER ──────────────────────────────────────────────────────

        // ── PATIENT INFO ───────────────────────────────────────────────────
        doc
          .fillColor('#2C3E50')
          .font('Bold')
          .fontSize(14)
          .text('1. Данные пациента', { continued: true })
          .font('Regular')
          .fontSize(12)
          .text(`  ID: ${userId}`)
          .moveDown(0.5);

        const infoLines = [
          `Возраст: ${userData.age ?? 'не указан'}`,
          `Рост: ${userData.height ?? 'не указан'} см`,
          `Вес: ${userData.weight ?? 'не указан'} кг`,
          `Заболевания: ${userData.diseases?.join(', ') ?? 'не указаны'}`,
        ];
        infoLines.forEach((line) => doc.text(`• ${line}`));
        doc.moveDown(1);
        // ── END PATIENT INFO ───────────────────────────────────────────────

        // ── RISK ASSESSMENT ────────────────────────────────────────────────
        const scorePct = (riskData.risk_score * 100).toFixed(1);
        const riskLevel = this.getRiskLevel(riskData.risk_score);
        const levelColor = this.getRiskColor(riskData.risk_score);

        doc
          .fillColor(levelColor)
          .font('Bold')
          .fontSize(16)
          .text(`${scorePct}%`, { continued: true })
          .font('Regular')
          .fontSize(12)
          .fillColor('#2C3E50')
          .text(`  (${riskLevel})`)
          .moveDown(1.5);
        // ── END RISK ASSESSMENT ───────────────────────────────────────────

        // ── RISK FACTORS ───────────────────────────────────────────────────
        doc
          .font('Bold')
          .fontSize(14)
          .fillColor('#2C3E50')
          .text('2. Факторы риска')
          .moveDown(0.5);

        doc.font('Regular').fontSize(12);
        riskData.risk_factors.forEach((f, i) => {
          const pct = (f.weight * 100).toFixed(1) + '%';
          doc
            .fillColor('#34495E')
            .text(`${i + 1}. ${f.label}`, { continued: true })
            .fillColor('#7F8C8D')
            .text(` (${this.translateSource(f.source)})`, { continued: true })
            .fillColor(levelColor)
            .text(` — ${pct}`);
        });
        doc.moveDown(1.5);
        // ── END RISK FACTORS ──────────────────────────────────────────────

        // ── RECOMMENDATIONS ───────────────────────────────────────────────
        doc
          .font('Bold')
          .fontSize(14)
          .fillColor('#2C3E50')
          .text('3. Рекомендации')
          .moveDown(0.5);

        doc.font('Regular').fontSize(12);
        this.getRecommendation(riskData.risk_score)
          .split('\n')
          .forEach((line) => {
            doc
              .circle(doc.x - 6, doc.y + 6, 3)
              .fill(levelColor)
              .fillColor('#2C3E50')
              .text(`  ${line}`)
              .moveDown(0.5);
          });
        // ── END RECOMMENDATIONS ──────────────────────────────────────────

        // ── FOOTER ────────────────────────────────────────────────────────
        const bottom = doc.page.height - 40;
        doc
          .fontSize(10)
          .fillColor('#95A5A6')
          .text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 72, bottom, {
            continued: true,
          })
          .text(` – Страница ${doc.page.number}`, {
            align: 'right',
            width: doc.page.width - 144,
          });
        // ── END FOOTER ────────────────────────────────────────────────────

        doc.end();
        stream.once('finish', () => resolve(filepath));
        stream.once('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  private getRiskColor(score: number): string {
    if (score > 0.7) return '#E74C3C';
    if (score > 0.4) return '#E67E22';
    return '#27AE60';
  }

  private getRiskLevel(score: number): string {
    if (score > 0.7) return 'Высокий';
    if (score > 0.4) return 'Средний';
    return 'Низкий';
  }

  private translateSource(source: string): string {
    const map: Record<string, string> = {
      SkinCheck: 'Анализ кожи',
      Anxiety: 'Тревожность',
      MedicalAnalyses: 'Анализ крови',
      BloodPressure: 'Артериальное давление',
      Cholesterol: 'Холестерин',
    };
    return map[source] || source;
  }

  private getRecommendation(score: number): string {
    if (score > 0.7) {
      return [
        'Обратитесь к врачу как можно скорее',
        'Пройдите углублённые обследования',
        'Следуйте рекомендациям специалиста',
      ].join('\n');
    }
    if (score > 0.4) {
      return [
        'Запланируйте плановый осмотр',
        'Контролируйте основные показатели',
      ].join('\n');
    }
    return [
      'Продолжайте вести здоровый образ жизни',
      'Профилактические осмотры раз в год',
    ].join('\n');
  }
}
