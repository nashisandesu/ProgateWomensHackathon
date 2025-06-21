import { useState, useEffect, useRef } from 'react';

interface UseCharacterReturn {
  selectedCharacter: number | null;
  hasSelectedCharacter: boolean;
  getCurrentGif: () => string;
  resetCharacterSelection: () => void;
}

export function useCharacter(level: number): UseCharacterReturn {
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [hasSelectedCharacter, setHasSelectedCharacter] = useState(false);
  const previousLevelRef = useRef<number>(level);

  // 初期ロード時に選択済みキャラクターを復元
  useEffect(() => {
    try {
      const storedCharacter = localStorage.getItem('todoQuestCharacter');
      const storedHasSelected = localStorage.getItem('todoQuestHasSelected');
      
      console.log('Loading character from localStorage:', { storedCharacter, storedHasSelected });
      
      if (storedCharacter && storedHasSelected === 'true') {
        setSelectedCharacter(parseInt(storedCharacter));
        setHasSelectedCharacter(true);
      }
    } catch (error) {
      console.error("Failed to load character from localStorage:", error);
    }
  }, []);

  // キャラクター選択の保存
  useEffect(() => {
    if (selectedCharacter !== null) {
      try {
        localStorage.setItem('todoQuestCharacter', selectedCharacter.toString());
        localStorage.setItem('todoQuestHasSelected', 'true');
        console.log('Saved character to localStorage:', selectedCharacter);
      } catch (error) {
        console.error("Failed to save character to localStorage:", error);
      }
    }
  }, [selectedCharacter]);

  // キャラクター抽選ロジック
  useEffect(() => {
    const previousLevel = previousLevelRef.current;
    const isLevelUp = level > previousLevel;
    const isLevelMod5Equals1 = level % 5 === 1;
    
    console.log('Character selection check:', { 
      level, 
      previousLevel, 
      isLevelUp, 
      isLevelMod5Equals1, 
      hasSelectedCharacter 
    });
    
    // 1. ゲーム開始時（キャラクターが未選択）の場合は抽選
    if (!hasSelectedCharacter) {
      // TODO: 本当は動的に変化するべき
      const randomCharacter = Math.floor(Math.random() * 6) + 1; // 1-6のキャラクター
      console.log('Game start - Selecting random character:', randomCharacter);
      setSelectedCharacter(randomCharacter);
      setHasSelectedCharacter(true);
    }
    // 2. レベルが上がって5で割って1余る時（レベル1, 6, 11, 16...）に抽選
    else if (isLevelUp && isLevelMod5Equals1) {
      const randomCharacter = Math.floor(Math.random() * 6) + 1; // 1-6のキャラクター
      console.log('Level up to level', level, '- Selecting random character:', randomCharacter);
      setSelectedCharacter(randomCharacter);
      setHasSelectedCharacter(true);
    }
    
    // 前のレベルを更新
    previousLevelRef.current = level;
  }, [level, hasSelectedCharacter]);

  // キャラクター抽選をリセットする関数（テスト用）
  const resetCharacterSelection = () => {
    console.log('Resetting character selection');
    setSelectedCharacter(null);
    setHasSelectedCharacter(false);
    localStorage.removeItem('todoQuestCharacter');
    localStorage.removeItem('todoQuestHasSelected');
  };

  // 現在のレベルに応じたGIFファイル名を取得
  const getCurrentGif = () => {
    if (!selectedCharacter) {
      console.log('No character selected, returning default cat');
      return "cat-animation.gif";
    }
    
    // レベルを1-5の範囲に正規化
    const normalizedLevel = ((level - 1) % 5) + 1;
    const gifPath = `/character${selectedCharacter}/level${normalizedLevel}.gif`;
    return gifPath;
  };

  return {
    selectedCharacter,
    hasSelectedCharacter,
    getCurrentGif,
    resetCharacterSelection,
  };
} 