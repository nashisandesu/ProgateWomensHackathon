import { useState, useEffect } from 'react';
import type { CollectionCharacter, Collection } from '../types';

export function useCollection() {
  const [collection, setCollection] = useState<Collection>(() => {
    const stored = localStorage.getItem('todoQuestCollection');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      characters: [],
      totalCharacters: 15, // 1-15のキャラクター
      unlockedCharacters: 0
    };
  });

  // コレクションの保存
  useEffect(() => {
    localStorage.setItem('todoQuestCollection', JSON.stringify(collection));
  }, [collection]);

  // キャラクターをコレクションに追加
  const addToCollection = (characterId: number, level: number) => {
    setCollection(prev => {
      // 既にコレクションに存在するかチェック
      const existingIndex = prev.characters.findIndex(c => c.id === characterId);
      
      if (existingIndex >= 0) {
        // 既存のキャラクターのレベルを更新
        const updatedCharacters = [...prev.characters];
        updatedCharacters[existingIndex] = {
          ...updatedCharacters[existingIndex],
          maxLevel: Math.max(updatedCharacters[existingIndex].maxLevel, level),
          unlockedAt: Math.min(updatedCharacters[existingIndex].unlockedAt, level)
        };
        
        return {
          ...prev,
          characters: updatedCharacters
        };
      } else {
        // 新しいキャラクターを追加
        const newCharacter: CollectionCharacter = {
          id: characterId,
          name: `キャラクター${characterId}`,
          maxLevel: level,
          unlockedAt: level,
          unlockedDate: new Date().toISOString(),
          gifUrl: `/character${characterId}/level5.gif` // 最終レベルのGIF
        };
        
        return {
          ...prev,
          characters: [...prev.characters, newCharacter],
          unlockedCharacters: prev.unlockedCharacters + 1
        };
      }
    });
  };

  // コレクションからキャラクターを取得
  const getCharacter = (characterId: number): CollectionCharacter | null => {
    return collection.characters.find(c => c.id === characterId) || null;
  };

  // コレクションの統計を取得
  const getCollectionStats = () => {
    return {
      total: collection.totalCharacters,
      unlocked: collection.unlockedCharacters,
      percentage: Math.round((collection.unlockedCharacters / collection.totalCharacters) * 100)
    };
  };

  return {
    collection,
    addToCollection,
    getCharacter,
    getCollectionStats
  };
} 