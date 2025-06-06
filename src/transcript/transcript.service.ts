import { Injectable } from '@nestjs/common';
import { AIService } from 'src/shared/services/ai.service';
import { PdfGeneratorService } from 'src/shared/services/pdf.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { SpeechToTextService } from 'src/speech-to-text/speech-to-text.service';

@Injectable()
export class TranscriptService {
  constructor(
    private prisma: PrismaService,
    private speechToText: SpeechToTextService,
    private aiService: AIService,
    private pdfService: PdfGeneratorService,
  ) {}

  async transcribe(
    file: Express.Multer.File,
    patient_id: number,
    doctor_id: number,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: patient_id },
    });
    console.log(file);
    const text = await this.speechToText.transcribeAudio(file);

    const userDataForPdf = {
      age: user.age,
      gender: user.gender,
      full_name: `${user.last_name} ${user.first_name} ${user.patronymic}`,
      height: user.height?.toNumber() || null,
      weight: user.weight?.toNumber() || null,
      diseases: user.diseases,
    };
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctor_id },
    });

    const parsed = await this.aiService.generateShortTextRecommendation(text);
    const pdfFilePath = await this.pdfService.generateShortSummary(
      userDataForPdf,
      parsed,
      doctor,
    );

    const rawPath = pdfFilePath.replace(/^\/?app/, '');
    const fullUrl = `https://spark-life-backend-production-d81a.up.railway.app${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;

    await this.prisma.transcript.create({
      data: {
        patient_id: patient_id,
        doctor_id: doctor_id,
        file_path: fullUrl,
      },
    });

    return { text: text };
  }

  async getTranscripts(patient_id?: number, doctor_id?: number) {
    return this.prisma.transcript.findMany({
      where: {
        ...(patient_id ? { patient_id: Number(patient_id) } : {}),
        ...(doctor_id ? { doctor_id: Number(doctor_id) } : {}),
      },
    });
  }

  async getLatestTranscript() {
    const latest = await this.prisma.transcript.findFirst();

    if (!latest) {
      throw new Error('No transcripts found');
    }

    return {
      file_path: latest.file_path,
    };
  }
}
