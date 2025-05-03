import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

export interface ExtendedRiskProfileData {
  risk_score: number;
  risk_level: 'Низкий' | 'Средний' | 'Высокий';
  risk_category: string;
  risk_factors: Array<{
    source: string;
    label: string;
    impact_description: string;
  }>;
  summary: string;
  recommendations: string[];
  follow_up_tests: string[];
  generated_at: string;
}
<<<<<<< HEAD
interface ShortSummaryOfAudioData {
  summary: string;
  recommendations: string[];
  generated_at: string;
}
=======
>>>>>>> 74f573f60837932b33724da410bc634a6f05a338

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
  private readonly logo = path.join(process.cwd(), 'uploads', 'logo.jpg');

  constructor() {
    if (!fs.existsSync(this.outputDir))
      fs.mkdirSync(this.outputDir, { recursive: true });
  }

  public async generateRiskReport(
    userId: number,
    userData: {
      full_name?: string;
      birthDate?: string;
      gender?: string;
      height?: number;
      weight?: number;
      diseases?: string[];
    },
    riskData: ExtendedRiskProfileData,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        /* ───────────────────────── CONFIG ───────────────────────── */
        const ACCENT = '#2297E4';
        const GREY_BG = '#F5F5F5';
        const LOGO_W = 42; // final logo width
        const LOGO_PAD_R = 6; // right padding inside header
        const LOGO_PAD_TOP = 20; // lift logo higher relative to text

        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 36, left: 36, right: 36, bottom: 36 },
        });
        const filepath = path.join(
          this.outputDir,
          `medical_report_${userId}_${Date.now()}.pdf`,
        );
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        /* fonts */
        doc.registerFont('Regular', this.fontRegular);
        doc.registerFont('Bold', this.fontBold);

        const pageWidth =
          doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const drawLine = (y: number) =>
          doc
            .moveTo(doc.page.margins.left, y)
            .lineTo(doc.page.margins.left + pageWidth, y)
            .stroke(ACCENT);

        /* ───────────────────────── HEADER ───────────────────────── */
        const titleStartY = doc.y;
        // ширина текста заголовка учитывает логотип + отступы
        const titleBoxW = pageWidth - LOGO_W - LOGO_PAD_R;
        doc
          .font('Bold')
          .fontSize(16)
          .text('Зерттеу нәтижесі / Результат исследования', {
            width: titleBoxW,
          });

        // логотип, поднятый над базовой линией, с правым отступом
        if (fs.existsSync(this.logo)) {
          doc.image(
            this.logo,
            doc.page.width - doc.page.margins.right - LOGO_W - LOGO_PAD_R,
            titleStartY - LOGO_PAD_TOP,
            {
              width: LOGO_W,
            },
          );
        }

        drawLine(doc.y + 6);
        doc.moveDown(1);

        /* ───────────── PATIENT & META INFO ───────────── */
        const translateGender = (g?: string) => {
          const v = (g || '').toLowerCase();
          if (['мужской', 'male', 'm'].includes(v)) return 'Мужской / Ер';
          if (['женский', 'female', 'f'].includes(v)) return 'Женский / Әйел';
          return g ?? '—';
        };

        const leftPairs: Array<[string, string]> = [
          ['Пациент / Науқас', userData.full_name ?? `ID ${userId}`],
          ['Номер пациента / Пациент нөмірі', `№${userId}`],
          ['Пол / Жынысы', translateGender(userData.gender)],
        ];
        const now = new Date(riskData.generated_at);
        const rightPairs: Array<[string, string]> = [
          ['Дата взятия / Алу күні', now.toLocaleDateString('ru-RU')],
          [
            'Время взятия / Уақыты',
            now.toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          ],
          [
            'Отчёт сформирован / Есеп жасалды',
            new Intl.DateTimeFormat('ru-RU', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(now),
          ],
        ];

        const colW = pageWidth / 2 - 10;
        const renderPairs = (
          pairs: [string, string][],
          x: number,
          y: number,
        ) => {
          pairs.forEach(([l, v]) => {
            doc
              .font('Regular')
              .fontSize(10)
              .fillColor('#424242')
              .text(`${l}: `, x, y, { continued: true });
            doc.font('Bold').fillColor('#000').text(v);
            y += 14;
          });
          return y;
        };

        const infoY = doc.y;
        const leftEndY = renderPairs(leftPairs, doc.page.margins.left, infoY);
        renderPairs(rightPairs, doc.page.margins.left + colW + 20, infoY);
        doc.y = Math.max(leftEndY, doc.y) + 8;
        drawLine(doc.y);
        doc.moveDown(0.8);

        /* ───────────────────────── TABLE ───────────────────────── */
        const headers = ['Көрсеткіш / Показатель', 'Категория', 'Описание'];
        const colWidths = [
          pageWidth * 0.28,
          pageWidth * 0.18,
          pageWidth * 0.54,
        ];
        const rows: string[][] = [
          [
            'Общий риск',
            riskData.risk_level,
            `Суммарный индекс вероятности составляет ${riskData.risk_score} % (категория – ${riskData.risk_category}).`,
          ],
          ...riskData.risk_factors.map((f) => [
            f.label,
            this.translateSource(f.source),
            f.impact_description,
          ]),
        ];

        const renderRow = (
          cells: string[],
          y: number,
          header = false,
          shaded = false,
        ) => {
          const heights = cells.map((c, i) => {
            doc.font(header ? 'Bold' : 'Regular').fontSize(9);
            return doc.heightOfString(c, { width: colWidths[i] - 12 });
          });
          const h = Math.max(...heights) + 12;
          let x = doc.page.margins.left;
          cells.forEach((_c, i) => {
            doc
              .rect(x, y, colWidths[i], h)
              .fill(header ? ACCENT : shaded ? GREY_BG : '#FFFFFF')
              .stroke('#BDBDBD');
            x += colWidths[i];
          });
          x = doc.page.margins.left;
          cells.forEach((c, i) => {
            doc
              .font(header ? 'Bold' : 'Regular')
              .fontSize(9)
              .fillColor(header ? '#FFFFFF' : '#000')
              .text(c, x + 6, y + 6, {
                width: colWidths[i] - 12,
                align: i === 2 ? 'left' : 'center',
              });
            x += colWidths[i];
          });
          return y + h;
        };

        let yPos = doc.y;
        yPos = renderRow(headers, yPos, true);
        rows.forEach((r, i) => (yPos = renderRow(r, yPos, false, i % 2 === 0)));
        doc.y = yPos + 12;

        /* ───────────────────────── TEXT SECTIONS ───────────────────────── */
        const writeSection = (title: string, body: string | string[]) => {
          doc.x = doc.page.margins.left;
          doc.font('Bold').fontSize(11).text(title, { underline: true });
          doc.moveDown(0.4);
          if (Array.isArray(body)) {
            body.forEach((b) => {
              doc.circle(doc.x - 4, doc.y + 4.5, 2).fill(ACCENT);
              doc
                .font('Regular')
                .fontSize(10)
                .fillColor('#000')
                .text('  ' + b);
            });
          } else {
            doc.font('Regular').fontSize(10).text(body, { align: 'justify' });
          }
          doc.moveDown(0.8);
        };

        writeSection('Резюме / Қорытынды', riskData.summary);
        writeSection('Рекомендации / Ұсынымдар', riskData.recommendations);
        writeSection(
          'Рекомендуемые обследования / Ұсынылатын тексерулер',
          riskData.follow_up_tests,
        );

        /* ───────────────────────── FOOTER ───────────────────────── */
        const footerY = doc.page.height - doc.page.margins.bottom + 14;
        drawLine(footerY - 10);

        doc.end();
        stream.on('finish', () => resolve(filepath));
        stream.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }
  private translateSource(source: string): string {
    const map: Record<string, string> = {
      SkinCheck: 'Анализ кожи',
      Anxiety: 'Тревожность',
      MedicalAnalyses: 'Анализ крови',
      MedicalAnalysis: 'Мед. анализ',
      BloodPressure: 'Артериальное давление',
      Cholesterol: 'Холестерин',
      MedicalHistory: 'Мед. история',
      PersonalData: 'Анкета',
    };
    return map[source] || source;
  }
<<<<<<< HEAD
  async generateShortSummary(
    userData: {
      full_name?: string;
      birthDate?: string;
      gender?: string;
      height?: number;
      weight?: number;
      diseases?: string[];
    },
    data: ShortSummaryOfAudioData,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const ACCENT = '#2297E4';
        const LOGO_W = 42;
        const LOGO_PAD_R = 6;
        const LOGO_PAD_TOP = 20;

        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 36, left: 36, right: 36, bottom: 36 },
        });
        const filePath = path.join(
          this.outputDir,
          `audio_summary_${Date.now()}.pdf`,
        );
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // fonts
        doc.registerFont('Regular', this.fontRegular);
        doc.registerFont('Bold', this.fontBold);

        const pageWidth =
          doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const drawLine = (y: number) =>
          doc
            .moveTo(doc.page.margins.left, y)
            .lineTo(doc.page.margins.left + pageWidth, y)
            .stroke(ACCENT);

        /* HEADER */
        const titleStartY = doc.y;
        const titleBoxW = pageWidth - LOGO_W - LOGO_PAD_R;
        doc
          .font('Bold')
          .fontSize(16)
          .text('Краткий аудио‑отчёт / Қысқаша дыбыстық есеп', {
            width: titleBoxW,
          });
        if (fs.existsSync(this.logo)) {
          doc.image(
            this.logo,
            doc.page.width - doc.page.margins.right - LOGO_W - LOGO_PAD_R,
            titleStartY - LOGO_PAD_TOP,
            { width: LOGO_W },
          );
        }
        drawLine(doc.y + 6);
        doc.moveDown(1);

        /* PATIENT INFO */
        const translateGender = (g?: string) => {
          const v = (g || '').toLowerCase();
          if (['мужской', 'male', 'm'].includes(v)) return 'Мужской / Ер';
          if (['женский', 'female', 'f'].includes(v)) return 'Женский / Әйел';
          return g ?? '—';
        };
        const pairs: Array<[string, string]> = [
          ['Пациент / Науқас', userData.full_name ?? '—'],
          ['Пол / Жынысы', translateGender(userData.gender)],
          [
            'Дата отчёта / Есеп күні',
            new Date(data.generated_at).toLocaleString('ru-RU'),
          ],
        ];
        pairs.forEach(([l, v]) => {
          doc
            .font('Regular')
            .fontSize(10)
            .fillColor('#424242')
            .text(`${l}: `, { continued: true });
          doc.font('Bold').fillColor('#000').text(v);
          doc.moveDown(0.2);
        });
        doc.moveDown(0.6);

        /* SUMMARY SECTION */
        const writeSection = (title: string, body: string | string[]) => {
          doc.font('Bold').fontSize(11).text(title, { underline: true });
          doc.moveDown(0.4);
          if (Array.isArray(body)) {
            body.forEach((b) => {
              doc.circle(doc.x - 4, doc.y + 4.5, 2).fill(ACCENT);
              doc
                .font('Regular')
                .fontSize(10)
                .fillColor('#000')
                .text('  ' + b);
            });
          } else {
            doc.font('Regular').fontSize(10).text(body, { align: 'justify' });
          }
          doc.moveDown(0.8);
        };

        writeSection('Резюме / Қорытынды', data.summary);
        writeSection('Рекомендации / Ұсынымдар', data.recommendations);

        /* FOOTER */
        const footerY = doc.page.height - doc.page.margins.bottom + 14;
        drawLine(footerY - 10);

        doc.end();
        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }
=======
>>>>>>> 74f573f60837932b33724da410bc634a6f05a338
}
