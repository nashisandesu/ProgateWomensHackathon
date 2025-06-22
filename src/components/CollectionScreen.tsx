import type { CollectionCharacter } from '../types';

interface CollectionScreenProps {
  collection: {
    characters: CollectionCharacter[];
    totalCharacters: number;
    unlockedCharacters: number;
  };
  onClose: () => void;
}

export function CollectionScreen({ collection, onClose }: CollectionScreenProps) {
  const stats = {
    total: collection.totalCharacters,
    unlocked: collection.unlockedCharacters,
    percentage: Math.round((collection.unlockedCharacters / collection.totalCharacters) * 100)
  };

  // 全キャラクターの配列を作成（ロックされているものも含む）
  const allCharacters = Array.from({ length: collection.totalCharacters }, (_, i) => {
    const characterId = i + 1;
    const unlockedCharacter = collection.characters.find(c => c.id === characterId);
    
    return {
      id: characterId,
      isUnlocked: !!unlockedCharacter,
      character: unlockedCharacter
    };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white border-4 border-black p-4 lg:p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl lg:text-3xl font-bold">キャラクターコレクション</h2>
          <button 
            onClick={onClose}
            className="nes-btn is-error text-sm lg:text-base"
          >
            ✕
          </button>
        </div>

        {/* 統計情報 */}
        <div className="mb-6 p-4 bg-gray-100 border-2 border-black">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.unlocked}</div>
              <div className="text-sm text-gray-600">獲得済み</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
              <div className="text-sm text-gray-600">総数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.percentage}%</div>
              <div className="text-sm text-gray-600">完成度</div>
            </div>
          </div>
          {/* プログレスバー */}
          <div className="mt-4">
            <div className="w-full bg-gray-300 border-2 border-black">
              <div 
                className="bg-green-500 h-4 transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* キャラクターグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {allCharacters.map(({ id, isUnlocked, character }) => (
            <div 
              key={id}
              className={`border-4 border-black p-3 text-center transition-all duration-200 ${
                isUnlocked 
                  ? 'bg-white hover:bg-gray-50 cursor-pointer' 
                  : 'bg-gray-300 opacity-60'
              }`}
            >
              {isUnlocked ? (
                <>
                  {/* キャラクター画像 */}
                  <div className="w-full h-24 lg:h-32 mb-2 flex items-center justify-center">
                    <img 
                      src={character?.gifUrl || `/character${id}/level5.gif`}
                      alt={`キャラクター${id}`}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        // 画像が見つからない場合のフォールバック
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-4xl">🐱</div>
                  </div>
                  
                  {/* キャラクター情報 */}
                  <div className="text-xs text-gray-600">
                    レベル 5
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {character?.unlockedDate ? 
                      new Date(character.unlockedDate).toLocaleDateString('ja-JP') : 
                      '獲得済み'
                    }
                  </div>
                </>
              ) : (
                <>
                  {/* ロックされたキャラクター */}
                  <div className="w-full h-24 lg:h-32 mb-2 flex items-center justify-center">
                    <img 
                      src="lock.png"
                      alt="ロック"
                      className="w-16 h-16 lg:w-20 lg:h-20 object-contain"
                    />
                  </div>
                  <div className="text-xs text-gray-400">未獲得</div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* ヒント */}
        <div className="mt-6 p-4 bg-yellow-100 border-2 border-yellow-400">
          <h3 className="font-bold text-yellow-800 mb-2">💡 ヒント</h3>
          <p className="text-sm text-yellow-700">
            タスクを完了してレベルアップすると、新しいキャラクターがランダムで選択されます。
            レベル5まで育てると、そのキャラクターがコレクションに追加されます！
          </p>
        </div>
      </div>
    </div>
  );
} 