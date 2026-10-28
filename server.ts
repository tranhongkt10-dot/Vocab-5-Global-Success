import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini API client if valid key exists
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Tutor chat endpoint
app.post('/api/ai-tutor', async (req: Request, res: Response) => {
  const { message, wordContext, history } = req.body;

  if (!message && !wordContext) {
    return res.status(400).json({ error: 'Message or word context is required' });
  }

  const systemInstruction = `Bạn là "Global Success AI" – một giáo viên tiếng Anh cực kỳ thân thiện, vui tính và luôn khích lệ học sinh lớp 5 Việt Nam đang học bộ sách Tiếng Anh 5 Global Success.
Nhiệm vụ của bạn:
1. Trả lời bằng tiếng Việt gần gũi, ấm áp, dễ hiểu cho trẻ em 10-11 tuổi.
2. Dùng các biểu tượng dễ thương như 🌟, 📚, ✨, 🎉, 🦉, 🌸.
3. Khi giải thích từ vựng: nêu rõ từ loại, phát âm chuẩn, nghĩa tiếng Việt, 1-2 ví dụ ngắn gọn trong đời sống học sinh và mẹo ghi nhớ thú vị (mnemonics hoặc vần điệu vui nhộn).
4. Luôn thêm lời khen ngợi và động viên học tập (ví dụ: "Em làm rất tốt!", "Chăm chỉ thế này chắc chắn điểm 10 tiếng Anh nhé!").
5. Giữ câu trả lời súc tích, không viết đoạn văn quá dài gây nản lòng cho học sinh tiểu học.`;

  let prompt = message || '';
  if (wordContext) {
    prompt = `[Từ vựng cần giải thích]:
Từ: "${wordContext.word}" (${wordContext.pos || 'từ'})
Phiên âm: ${wordContext.ipa || ''}
Nghĩa: ${wordContext.meaning_vi || ''}
Ví dụ gốc: "${wordContext.example_en || ''}" (${wordContext.example_vi || ''})
Thuộc Unit: ${wordContext.unit || 'Grade 5'}

Câu hỏi của học sinh: ${message || 'Cô/Thầy ơi, giải thích từ này cho em với và cho em mẹo nhớ nhé!'}`;
  }

  if (ai) {
    try {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timed out')), 5000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      const reply = response.text || 'Thầy/Cô đây rồi! Em hãy chăm chỉ luyện tập nhé 🌟';
      return res.json({ reply });
    } catch (err: any) {
      console.warn('Gemini API call error or timeout, utilizing smart fallback:', err?.message || err);
    }
  }

  // Graceful smart fallback for when API key is not configured or network issue occurs
  let fallbackReply = `Chào em yêu quý! 🌟 Thầy/Cô Global Success luôn đồng hành cùng em. `;
  if (wordContext) {
    fallbackReply += `\n\n📖 Từ **${wordContext.word}** (${wordContext.pos}):
- Nghĩa: **${wordContext.meaning_vi}**
- Phát âm: *${wordContext.ipa}*
- Ví dụ mẫu: "${wordContext.example_en}" (${wordContext.example_vi})
💡 **Mẹo nhỏ:** Hãy đọc to từ này 3 lần và thử tự đặt một câu ngắn với bạn bè nhé! Em học rất chăm chỉ đấy, tiếp tục phát huy nào! 🎉`;
  } else {
    fallbackReply += `\n\nEm đang học bài rất tốt! Hãy tiếp tục luyện tập các phần Bài tập Chính tả, Nghe và Trắc nghiệm nghĩa từ nhé. Mỗi ngày 10 phút là em sẽ trở thành siêu sao Tiếng Anh lớp 5 ngay! 🏆✨`;
  }

  return res.json({ reply: fallbackReply });
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();
