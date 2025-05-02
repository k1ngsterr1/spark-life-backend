import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
const PDFDocument = require('pdfkit');

export interface ExtendedRiskProfileData {
  risk_score: number;
  risk_level: 'Низкий' | 'Средний' | 'Высокий';
  risk_category: string;
  risk_factors: Array<{
    source: string;
    label: string;
    weight: number;
    impact_description: string;
  }>;
  summary: string;
  recommendations: string[];
  follow_up_tests: string[];
  generated_at: string; // ISO timestamp
}

@Injectable()
export class PdfGeneratorService {
  private readonly outputDir = path.join(process.cwd(), 'uploads');
  private readonly fontRegular = path.join(
    process.cwd(),
    'fonts',
    'Roboto.ttf',
  );
  private readonly fontBold = path.join(
    process.cwd(),
    'fonts',
    'Roboto-Bold.ttf',
  );

  constructor() {
    this.ensureOutputDirectoryExists();
  }

  private ensureOutputDirectoryExists() {
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
    riskData: ExtendedRiskProfileData,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 80, bottom: 72, left: 72, right: 72 },
        });

        if (!fs.existsSync(this.fontRegular)) {
          throw new Error(`Font not found: ${this.fontRegular}`);
        }
        doc.registerFont('Regular', this.fontRegular);

        if (!fs.existsSync(this.fontBold)) {
          throw new Error(`Font not found: ${this.fontBold}`);
        }
        doc.registerFont('Bold', this.fontBold);

        doc.font('Regular');

        const filename = `medical_report_${userId}_${Date.now()}.pdf`;
        const filepath = path.join(this.outputDir, filename);
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // ── HEADER ─
        doc.fillColor('#2C3E50').rect(0, 0, doc.page.width, 80).fill();
        doc
          .fillColor('#FFFFFF')
          .font('Bold')
          .fontSize(20)
          .text('SPARK HEALTH', 72, 24, { align: 'left' })
          .text('Медицинский отчёт о рисках', 0, 28, { align: 'center' })
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

        // ── PATIENT INFO ─
        doc
          .fillColor('#2C3E50')
          .font('Bold')
          .fontSize(14)
          .text('1. Данные пациента')
          .moveDown(0.5)
          .font('Regular')
          .fontSize(12);

        const infoLines = [
          `ID: ${userId}`,
          `Возраст: ${userData.age ?? 'не указан'}`,
          `Рост: ${userData.height ?? 'не указан'} см`,
          `Вес: ${userData.weight ?? 'не указан'} кг`,
          `Заболевания: ${userData.diseases?.join(', ') ?? 'не указаны'}`,
        ];

        for (const line of infoLines) {
          doc.text(`• ${line}`);
        }

        doc.moveDown(1.5);

        // ── RISK OVERVIEW ─
        doc
          .font('Bold')
          .fontSize(14)
          .fillColor('#2C3E50')
          .text('2. Общая оценка риска')
          .moveDown(0.5);

        const pct = (riskData.risk_score * 100).toFixed(1);
        doc
          .font('Bold')
          .fontSize(20)
          .fillColor(this.getRiskColor(riskData.risk_score))
          .text(`${pct}%`, { continued: true })
          .font('Regular')
          .fontSize(12)
          .fillColor('#2C3E50')
          .text(
            `  (${riskData.risk_level}, категория: ${riskData.risk_category})`,
          );

        doc.moveDown(1.5);

        // ── RISK FACTORS ─
        doc
          .font('Bold')
          .fontSize(14)
          .fillColor('#2C3E50')
          .text('3. Факторы риска')
          .moveDown(0.5)
          .font('Regular')
          .fontSize(12);

        for (let i = 0; i < riskData.risk_factors.length; i++) {
          const f = riskData.risk_factors[i];
          const weightPct = (f.weight * 100).toFixed(1) + '%';

          doc
            .fillColor('#34495E')
            .text(`${i + 1}. ${f.label}`, { continued: true })
            .fillColor('#7F8C8D')
            .text(` (${f.source})`, { continued: true })
            .fillColor(this.getRiskColor(riskData.risk_score))
            .text(` — ${weightPct}`)
            .moveDown(0.3);

          doc
            .fillColor('#2C3E50')
            .fontSize(10)
            .text(`   Описание влияния: ${f.impact_description}`)
            .moveDown(0.7);

          doc.fontSize(12);
        }

        doc.moveDown(1);

        // ── SUMMARY ─
        doc
          .font('Bold')
          .fontSize(14)
          .fillColor('#2C3E50')
          .text('4. Краткое резюме')
          .moveDown(0.5)
          .font('Regular')
          .fontSize(12)
          .fillColor('#2C3E50')
          .text(riskData.summary, { align: 'justify' })
          .moveDown(1.5);

        // ── RECOMMENDATIONS ─
        doc
          .font('Bold')
          .fontSize(14)
          .fillColor('#2C3E50')
          .text('5. Рекомендации')
          .moveDown(0.5)
          .font('Regular')
          .fontSize(12);

        for (const rec of riskData.recommendations) {
          doc
            .circle(doc.x - 6, doc.y + 6, 3)
            .fill(this.getRiskColor(riskData.risk_score))
            .fillColor('#2C3E50')
            .text(`  ${rec}`)
            .moveDown(0.5);
        }

        doc.moveDown(1);

        // ── FOLLOW-UP TESTS ─
        doc
          .font('Bold')
          .fontSize(14)
          .fillColor('#2C3E50')
          .text('6. Рекомендуемые обследования')
          .moveDown(0.5)
          .font('Regular')
          .fontSize(12);

        for (const test of riskData.follow_up_tests) {
          doc.text(`• ${test}`).moveDown(0.3);
        }

        doc.moveDown(1.5);

        // ── FOOTER ─
        const bottom = doc.page.height - 40;
        doc
          .fontSize(10)
          .fillColor('#95A5A6')
          .text(
            `Сгенерировано: ${new Date(riskData.generated_at).toLocaleString('ru-RU')}`,
            72,
            bottom,
            {
              continued: true,
            },
          )
          .text(` – Страница ${doc.page.number}`, {
            align: 'right',
            width: doc.page.width - 144,
          });

        doc.end();
        stream.once('finish', () => resolve(filepath));
        stream.once('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }

  private getRiskColor(score: number): string {
    if (score > 0.7) return '#E74C3C'; // red
    if (score > 0.4) return '#E67E22'; // orange
    return '#27AE60'; // green
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
}
