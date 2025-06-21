import { useCharacter } from '../hooks';

// レベルアップ時のお祝いメッセージ管理（5で割った余りで管理）
const CONGRATULATION_MESSAGES = {
  1: "新しい生命の予感…!!",
  2: "ムズムズ…何が出てくるんだろう？",
  3: "おめでとう！小さな命がここに輝く！",
  4: "ベイビーが大人になった！",
  5: "おめでとう！かけがえのない仲間ができたよ！\nさらに、新しい命の予感も…！"
} as const;

interface LevelUpPopupProps {
  show: boolean;
  levelUpData: { newLevel: number; newXp: number } | null;
  onClose: () => void;
}

export function LevelUpPopup({ show, levelUpData, onClose }: LevelUpPopupProps) {
  const { getCurrentGif } = useCharacter(levelUpData?.newLevel || 1);
  
  if (!show || !levelUpData) return null;

  const characterGif = getCurrentGif();
  
  // レベルを5で割った余りでお祝いメッセージを取得（余りが0の場合は5として扱う）
  const levelRemainder = (levelUpData.newLevel - 1) % 5 || 5;
  console.log(levelRemainder);
  const congratulationMessage = CONGRATULATION_MESSAGES[levelRemainder as keyof typeof CONGRATULATION_MESSAGES] || 
    "おめでとうございます！\n新しいレベルでさらに頑張りましょう！";

  // レベル5の倍数かどうかを判定
  const isCollectionUnlocked = levelRemainder === 5;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white border-4 border-yellow-400 rounded-lg p-6 w-full max-w-md mx-auto text-center">
        {/* レベルアップアニメーション */}
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        
        {/* コレクション追加表示（レベル5の倍数の場合） */}
        {isCollectionUnlocked && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg border-2 border-purple-600 animate-pulse">
            <div className="text-white font-bold text-lg">コレクションに追加されました！</div>
          </div>
        )}
        
        {/* タイトル */}
        <h2 className="text-2xl font-bold text-yellow-600 mb-4">
          レベルアップ！
        </h2>
        
        {/* 新しいレベル表示 */}
        <div className="text-xl font-bold text-gray-800 mb-4">
          Level {levelUpData.newLevel} になりました！
        </div>
        
        {/* 新しいキャラクター姿 */}
        <div className="mb-6">
          <img 
            src={characterGif} 
            className="w-32 h-32 mx-auto border-4 border-yellow-400 rounded-lg" 
            alt="新しいキャラクター姿"
          />
        </div>
        
        {/* 経験値情報 */}
        <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-3 mb-6">
          <div className="text-sm text-gray-600 mb-1">現在の経験値</div>
          <div className="text-lg font-bold text-blue-600">
            {levelUpData.newXp} XP
          </div>
          <div className="w-full bg-gray-300 border border-gray-400 mt-2">
            <div 
              className="bg-blue-500 h-3 transition-all duration-300"
              style={{ width: `${Math.min(100, ((levelUpData.newXp % 100) / 100) * 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            次のレベルまで: {100 - (levelUpData.newXp % 100)} XP
          </div>
        </div>
        
        {/* お祝いメッセージ */}
        <div className="text-gray-700 mb-6">
          <p className="text-sm whitespace-pre-line">
            {congratulationMessage}
          </p>
        </div>
        
        {/* 確認ボタン */}
        <button 
          className="nes-btn is-success px-8 py-3 text-lg font-bold"
          onClick={onClose}
        >
          ✨ 確認
        </button>
      </div>
    </div>
  );
} 