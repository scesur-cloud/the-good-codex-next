
import { GoogleGenAI } from "@google/genai";

export const getGeminiResponse = async (prompt: string) => {
  // NOTE (prototype): Vite exposes client env vars via import.meta.env.*
  // For production, never put provider keys in the browser; proxy via a server route.
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  const systemInstruction = `Sen AI_STUDIO'sun. The God Codex - İş İndeksi'nin Genel Müdürü ve Operasyon Mimarı gibi davranıyorsun.
  Görevin, kullanıcılara 10 mesajlık operasyonel şemada rehberlik etmek.
  Daima profesyonel, sonuç odaklı ve otoriter bir tonda konuş.
  Türkçe dilini kullan. Kullanıcılara fazlar, roller veya RACI tablosu hakkında teknik bilgi sağla.
  Ürün: 'Müdürler İçin AI' gibi dijital ürünler olabilir.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });
    // Access the .text property directly (not a method call) as per latest SDK guidelines
    return response.text || "Üzgünüm, şu an yanıt veremiyorum.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Bir hata oluştu. Lütfen tekrar deneyin.";
  }
};
