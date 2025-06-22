interface CollectionPopupProps {
  show: boolean;
  characterId: number | null;
  onClose: () => void;
}

export function CollectionPopup({ show, characterId, onClose }: CollectionPopupProps) {
  if (!show || characterId === null) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
      <div className="bg-white border-4 border-purple-400 rounded-lg p-6 w-full max-w-md mx-auto text-center">
        {/* コレクション追加アニメーション */}
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        
        {/* タイトル */}
        <h2 className="text-2xl font-bold text-purple-600 mb-4">
          コレクションに追加！
        </h2>
        
        {/* キャラクター画像 */}
        <div className="mb-6">
          <img 
            src={`/character${characterId}/level5.gif`}
            className="w-32 h-32 mx-auto border-4 border-purple-400 rounded-lg" 
            alt={`キャラクター${characterId}`}
            onError={(e) => {
              // 画像が見つからない場合のフォールバック
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden text-4xl">🐱</div>
        </div>
        
        {/* メッセージ */}
        <div className="text-gray-700 mb-6">
          <p className="text-lg font-bold mb-2">
            キャラクター {characterId} がコレクションに追加されました！
          </p>
          <p className="text-sm text-gray-600">
            レベル5まで育て上げたキャラクターが記録されました。
            次は新しいキャラクターで冒険を続けましょう！
          </p>
        </div>
        
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200"
        >
          新しい冒険を始める
        </button>
      </div>
    </div>
  );
} 