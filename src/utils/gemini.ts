import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini APIキー（実際のAPIキーに置き換えてください）
const GEMINI_API_KEY = "your_gemini_api_key_here";

// Gemini APIを使って経験値を自動計算する関数
export async function calculateExperiencePoints(taskTitle: string): Promise<number> {
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
以下のタスクの難易度に基づいて、5から100の間で経験値を決定してください。
経験値は5の倍数で返してください。

タスク: "${taskTitle}"

考慮すべき要素:
- タスクの複雑さ
- 必要な時間
- 精神的・肉体的な負荷
- スキルレベル

回答は数字のみで返してください（例: 25）。
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // 数字のみを抽出
    const numberMatch = text.match(/\d+/);
    if (numberMatch) {
      let points = parseInt(numberMatch[0]);
      // 5の倍数に調整
      points = Math.round(points / 5) * 5;
      // 5-100の範囲に制限
      points = Math.max(5, Math.min(100, points));
      return points;
    }
    
    // デフォルト値
    return 15;
  } catch (error) {
    console.error('Gemini API error:', error);
    // エラー時はデフォルト値
    return 15;
  }
} 