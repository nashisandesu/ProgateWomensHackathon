export interface Task {
    id: string;
    title: string;
    point: number;
    done: boolean;
    due?: string;
  }

export interface CollectionCharacter {
  id: number;
  unlockedDate: string; // 日付
  gifUrl: string; // 最終レベルのGIF
}

export interface Collection {
  characters: CollectionCharacter[];
  totalCharacters: number;
  unlockedCharacters: number;
}