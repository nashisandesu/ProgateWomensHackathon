
// Gemini APIキー（実際のAPIキーに置き換えてください）
const GEMINI_API_KEY = "あなたのAPI"; // ここに正しいキーが入っているはず

import { GoogleGenerativeAI } from '@google/generative-ai';
// Gemini APIを使って経験値を自動計算する関数
export async function calculateExperiencePoints(taskTitle: string): Promise<number> {
  try {
    console.log("Gemini: API呼び出し開始", { taskTitle });

    // APIキーが空文字列または未定義でないかのみをチェック
    // 特定のデフォルト値との比較は削除
    if (!GEMINI_API_KEY) { // これだけで十分
      console.error("Gemini APIキーが設定されていません。");
      return 15; // デフォルト値を返す
    }
    
    // ここで正しいAPIキーが使われていることを確認するためにログを出力
    console.log("Gemini: APIキーが設定されています。キーの最初の5文字:", GEMINI_API_KEY.substring(0, 5));
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
以下のタスクの難易度に基づいて、5から100の間で経験値を決定してください。
経験値は5の倍数で返してください。

タスク: "${taskTitle}"

考慮すべき要素:
- タスクの複雑さ
- 必要な時間
- 精神的・肉体的な負荷
- スキルレベル

回答は数字のみで返してください（例: 25）。**余計な文字は一切含めないでください。**
`; // プロンプトをさらに強調

    console.log("Gemini: generateContent呼び出し前");
    const result = await model.generateContent(prompt);
    console.log("Gemini: generateContent呼び出し後", result);

    // ライブラリの推奨する方法でテキストコンテンツを取得
    const text = result.response.text();
    console.log("Extracted text directly:", text); // ★このログが最も重要！

    // 数字のみを抽出
    const numberMatch = text.match(/\d+/);
    if (numberMatch) {
      let points = parseInt(numberMatch[0]);
      // 5の倍数に調整
      points = Math.round(points / 5) * 5;
      // 5-100の範囲に制限
      points = Math.max(5, Math.min(100, points));
      console.log("Gemini: 経験値算出結果", points);
      return points;
    }
    
    console.log("Gemini: 数値抽出失敗、デフォルト値15を返却");
    return 15;
  } catch (error) {
    console.error('Gemini API error:', error);
    return 15; // エラー時はデフォルト値
  }
}