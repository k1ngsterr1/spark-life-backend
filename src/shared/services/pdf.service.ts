import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfGeneratorService {
  private readonly outputDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), 'uploads');
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
      risk_factors: Array<{
        source: string;
        label: string;
        weight: number;
      }>;
    },
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const fileName = `medical_report_${userId}_${Date.now()}.pdf`;
        const filePath = path.join(this.outputDir, fileName);
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Add document header
        this.addHeader(doc);

        // Add patient information section
        this.addPatientInfo(doc, userId, userData);

        // Add risk assessment section
        this.addRiskAssessment(doc, riskData.risk_score);

        // Add risk factors section
        this.addRiskFactors(doc, riskData.risk_factors);

        // Add recommendations
        this.addRecommendations(doc, riskData.risk_score);

        // Add footer
        this.addFooter(doc);

        doc.end();

        stream.on('finish', () => resolve(filePath));
        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  private addHeader(doc: PDFDocument): void {
    doc
      .fontSize(20)
      .text('Медицинский отчет о рисках', { align: 'center' })
      .moveDown(0.5)
      .fontSize(10)
      .text('Конфиденциальный документ', { align: 'center' })
      .moveDown(2);
  }

  private addPatientInfo(
    doc: PDFDocument,
    userId: number,
    userData: {
      age?: number;
      height?: number;
      weight?: number;
      diseases?: string[];
    },
  ): void {
    doc
      .fontSize(16)
      .text('1. Данные пациента:', { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .text(`• ID пациента: ${userId}`)
      .text(`• Возраст: ${userData.age || 'не указан'}`)
      .text(`• Рост: ${userData.height || 'не указан'} см`)
      .text(`• Вес: ${userData.weight || 'не указан'} кг`)
      .text(`• Заболевания: ${userData.diseases?.join(', ') || 'не указаны'}`)
      .moveDown(2);
  }

  private addRiskAssessment(doc: PDFDocument, riskScore: number): void {
    doc
      .fontSize(16)
      .text('2. Оценка рисков:', { underline: true })
      .moveDown(0.5);

    const scorePercentage = (riskScore * 100).toFixed(1);
    const riskLevel = this.getRiskLevel(riskScore);

    doc
      .fontSize(14)
      .fillColor(this.getRiskColor(riskScore))
      .text(`• Общий уровень риска: ${scorePercentage}% (${riskLevel})`)
      .fillColor('black')
      .moveDown(2);
  }

  private addRiskFactors(
    doc: PDFDocument,
    riskFactors: Array<{
      source: string;
      label: string;
      weight: number;
    }>,
  ): void {
    doc
      .fontSize(16)
      .text('3. Факторы риска:', { underline: true })
      .moveDown(0.5);

    riskFactors.forEach((factor, index) => {
      const weightPercentage = (factor.weight * 100).toFixed(1);
      doc
        .fontSize(12)
        .text(`${index + 1}. ${factor.label}`, { continued: true })
        .fillColor('gray')
        .text(` (${this.translateSource(factor.source)})`, { continued: true })
        .fillColor('black')
        .text(` - Влияние: ${weightPercentage}%`);
    });

    doc.moveDown(2);
  }

  private addRecommendations(doc: PDFDocument, riskScore: number): void {
    doc
      .fontSize(16)
      .text('4. Рекомендации:', { underline: true })
      .moveDown(0.5)
      .fontSize(12)
      .text(this.getRecommendation(riskScore))
      .moveDown(2);
  }

  private addFooter(doc: PDFDocument): void {
    doc
      .fontSize(10)
      .text('________________________________________', { align: 'center' })
      .text('Дата формирования: ' + new Date().toLocaleDateString('ru-RU'), {
        align: 'center',
      })
      .text('Документ сгенерирован автоматически', { align: 'center' });
  }

  private getRiskColor(score: number): string {
    if (score > 0.7) return 'red';
    if (score > 0.4) return 'orange';
    return 'green';
  }

  private getRiskLevel(score: number): string {
    if (score > 0.7) return 'Высокий';
    if (score > 0.4) return 'Средний';
    return 'Низкий';
  }

  private translateSource(source: string): string {
    const translations: Record<string, string> = {
      SkinCheck: 'Анализ кожи',
      Anxiety: 'Тревожность',
      MedicalAnalyses: 'Анализы крови',
      BloodPressure: 'Артериальное давление',
      Cholesterol: 'Холестерин',
    };
    return translations[source] || source;
  }

  private getRecommendation(score: number): string {
    if (score > 0.7) {
      return [
        '• Срочно обратитесь к лечащему врачу',
        '• Пройдите дополнительные обследования',
        '• Соблюдайте все предписания специалистов',
        '• Регулярно контролируйте показатели здоровья',
      ].join('\n');
    }

    if (score > 0.4) {
      return [
        '• Запишитесь на плановый осмотр к врачу',
        '• Пройдите рекомендуемые профилактические обследования',
        '• Скорректируйте образ жизни согласно рекомендациям',
        '• Ведите дневник самочувствия',
      ].join('\n');
    }

    return [
      '• Продолжайте регулярные профилактические осмотры',
      '• Поддерживайте здоровый образ жизни',
      '• Контролируйте основные показатели здоровья',
    ].join('\n');
  }
}
