import { useState, useEffect, useRef } from 'react';
import type { Task } from '../types';
import { v4 as uuid } from 'uuid';
import { MAX_HP } from '../utils/constants';
import { useCollection } from './useCollection';

// メッセージの型定義
interface Message {
  id: string;
  type: 'xpGain' | 'levelUp' | 'hpLoss';
  content: string;
  point?: number;
  amount?: number;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [lastHpCheck, setLastHpCheck] = useState<number>(0);
  const [hp, setHp] = useState<number>(() => {
    // localStorageからHPを読み込み、なければ最大HPで初期化
    const storedHp = localStorage.getItem('todoQuestHp');
    if (storedHp) {
      return Number(storedHp);
    } else {
      // localStorageに値がない場合は、MAX_HPで初期化してlocalStorageにも保存
      localStorage.setItem('todoQuestHp', MAX_HP.toString());
      return MAX_HP;
    }
  });
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [showOverdueNotification, setShowOverdueNotification] = useState(false);
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; newXp: number } | null>(null);
  
  // コレクション追加のポップアップ制御用の状態
  const [showCollectionPopup, setShowCollectionPopup] = useState(false);
  const [collectionCharacterId, setCollectionCharacterId] = useState<number | null>(null);
  
  // キャラクター関連の状態
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(() => {
    const stored = localStorage.getItem("todoQuestCharacter");
    return stored ? Number(stored) : null;
  });

  const [hasSelectedCharacter, setHasSelectedCharacter] = useState<boolean>(() => {
    return localStorage.getItem("todoQuestHasSelected") === "true";
  });

  const previousLevelRef = useRef<number>(1);
  
  // メッセージ表示の制御用
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // コレクション機能を統合
  const { addToCollection, getCollectionStats, collection } = useCollection();
  
  // addToCollectionを安定化するためのref
  const addToCollectionRef = useRef(addToCollection);
  addToCollectionRef.current = addToCollection;

  // 経験値とレベル計算（キャラクター選択ロジックより前に配置）
  const xp = tasks.filter(t => t.done).reduce((sum, t) => sum + t.point, 0);
  const level = Math.floor(xp / 100) + 1;

  // キャラクター選択のヘルパー関数
  const pickRandomCharacter = () => {
    const random = Math.floor(Math.random() * 15) + 1; // 1–15
    setSelectedCharacter(random);
    setHasSelectedCharacter(true);
  };

  // キャラクター選択のリセット関数
  const resetCharacterSelection = () => {
    console.log("Resetting character selection");
    setSelectedCharacter(null);
    setHasSelectedCharacter(false);
    localStorage.removeItem("todoQuestCharacter");
    localStorage.removeItem("todoQuestHasSelected");
  };

  // 現在のGIFを取得する関数
  const getCurrentGif = (currentLevel: number) => {
    if (selectedCharacter === null) return "cat-animation.gif";

    const normalizedLevel = ((currentLevel - 1) % 5) + 1; // 1–5
    return `/character${selectedCharacter}/level${normalizedLevel}.gif`;
  };

  // HPをlocalStorageに保存する関数
  const saveHpToStorage = (newHp: number) => {
    try {
      localStorage.setItem('todoQuestHp', newHp.toString());
    } catch (error) {
      console.error("Failed to save HP to localStorage:", error);
    }
  };

  // HPを減少させる関数
  const decreaseHp = (amount: number) => {
    setHp(prevHp => {
      const newHp = Math.max(0, prevHp - amount);
      saveHpToStorage(newHp);
      return newHp;
    });
  };

  // HPを回復させる関数
  const healHp = (amount: number) => {
    setHp(prevHp => {
      const newHp = Math.min(MAX_HP, prevHp + amount);
      saveHpToStorage(newHp);
      return newHp;
    });
  };

  // HPを最大値にリセットする関数
  const resetHp = () => {
    setHp(MAX_HP);
    saveHpToStorage(MAX_HP);
  };

  // キャラクター状態の永続化
  useEffect(() => {
    if (selectedCharacter !== null) {
      try {
        localStorage.setItem("todoQuestCharacter", selectedCharacter.toString());
        localStorage.setItem("todoQuestHasSelected", "true");
        console.log("Saved character to localStorage:", selectedCharacter);
      } catch (err) {
        console.error("Failed to save character to localStorage:", err);
      }
    }
  }, [selectedCharacter]);

  // キャラクター選択ロジック
  useEffect(() => {
    const prev = previousLevelRef.current;
    const isLevelUp = level > prev;
    const isPickTiming = level !== 0 && level % 5 === 1; // 1,6,11,…

    if (!hasSelectedCharacter) {
      // 初回のみ
      pickRandomCharacter();
    } else if (isLevelUp && isPickTiming && !showCollectionPopup) {
      // レベルアップした瞬間のみ抽選（コレクションポップアップが表示されていない時のみ）
      pickRandomCharacter();
    }
  }, [level, hasSelectedCharacter, showCollectionPopup]);

  // コレクション追加ロジック：レベルアップした瞬間のみコレクションに追加
  useEffect(() => {
    const prev = previousLevelRef.current;
    const isLevelUp = level > prev;
    const isCollectionLevel = level > 1 && (level - 1) % 5 === 0;
    
    console.log("Collection check:", {
      selectedCharacter,
      level,
      prev,
      isLevelUp,
      isCollectionLevel,
      condition: selectedCharacter !== null && isLevelUp && isCollectionLevel
    });
    
    // 各条件を個別にチェック
    console.log("Individual conditions:", {
      hasSelectedCharacter: selectedCharacter !== null,
      isLevelUp,
      isCollectionLevel,
      allConditionsMet: selectedCharacter !== null && isLevelUp && isCollectionLevel
    });
    
    if (selectedCharacter !== null && isLevelUp && isCollectionLevel) {
      // コレクション追加のポップアップを先に表示
      setCollectionCharacterId(selectedCharacter);
      setShowCollectionPopup(true);
      
      // レベルアップポップアップが表示されている場合は閉じる
      if (showLevelUpPopup) {
        setShowLevelUpPopup(false);
        setLevelUpData(null);
      }
      
      console.log(`Collection popup shown for character ${selectedCharacter} at level ${level}`);
    } else {
      console.log("Collection add skipped:", {
        reason: !selectedCharacter ? "no character selected" : 
                !isLevelUp ? "not level up" : 
                !isCollectionLevel ? "not collection level" : "unknown"
      });
    }
    
    // コレクション追加処理の後にpreviousLevelRefを更新
    previousLevelRef.current = level;
  }, [level]);

  // 初期ロード
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('todoQuestTasks');
      if (storedTasks) {
        const loadedTasks = JSON.parse(storedTasks);
        setTasks(loadedTasks);
        
        // 初期ロード時に過去の期限切れタスクを計算
        const now = new Date();
        const initialOverdueTasks = loadedTasks.filter((t: Task) => 
          !t.done && t.due && new Date(t.due) < now
        );
        setOverdueTasks(initialOverdueTasks);
        if (initialOverdueTasks.length > 0) {
          setShowOverdueNotification(true);
        }
      }
      
      // lastHpCheckを現在時刻に設定
      setLastHpCheck(Date.now());
    } catch (error) {
      console.error("Failed to load data from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // タスクの保存
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('todoQuestTasks', JSON.stringify(tasks));
      } catch (error) {
        console.error("Failed to save tasks to localStorage:", error);
      }
    }
  }, [tasks, isLoading]);

  // 期限切れタスクのチェックとHP減少（統合版）
  useEffect(() => {
    if (isLoading) return;

    const checkOverdueTasks = () => {
      const now = new Date();
      const overdueTasks = tasks.filter(t => !t.done && t.due && new Date(t.due) < now);
      
      // 前回のチェック以降に期限切れになったタスクを検出
      const newOverdueTasks = overdueTasks.filter(task => 
        new Date(task.due!).getTime() > lastHpCheck
      );
      
      // 期限切れタスクの状態を更新
      setOverdueTasks(overdueTasks);
      setShowOverdueNotification(overdueTasks.length > 0);
      
      // 新しい期限切れタスクがある場合、HP減少アニメーションを表示し、HPを減少
      if (newOverdueTasks.length > 0) {
        addMessageToQueue({ type: 'hpLoss', content: `HP -${newOverdueTasks.length} 💔`, amount: newOverdueTasks.length });
        decreaseHp(newOverdueTasks.length);
        setLastHpCheck(now.getTime());
      }
    };

    // 初回チェック
    checkOverdueTasks();

    // 10秒ごとにチェック
    const interval = setInterval(checkOverdueTasks, 10000);

    return () => clearInterval(interval);
  }, [tasks, lastHpCheck, isLoading]);

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(t => {
        if (t.id === id) {
          const wasDone = t.done;
          const newDone = !wasDone;
          
          // タスクが完了状態になった場合、経験値Getアニメーションを表示
          if (!wasDone && newDone) {
            // 更新後のタスク配列を使用して経験値を計算
            const updatedTasksForCalculation = prev.map(task => 
              task.id === id ? { ...task, done: newDone } : task
            );
            const currentXp = updatedTasksForCalculation.filter(task => task.done).reduce((sum, task) => sum + task.point, 0);
            const currentLevel = Math.floor(currentXp / 100) + 1;
            const previousLevel = Math.floor((currentXp - t.point) / 100) + 1;
            
            // 経験値ゲットを先に表示
            addMessageToQueue({ type: 'xpGain', content: `EXP Get! +${t.point} XP`, point: t.point });
            
            // レベルアップした場合はポップアップを表示（コレクション追加ポップアップが表示されていない時のみ）
            if (currentLevel > previousLevel && !showCollectionPopup) {
              setLevelUpData({ newLevel: currentLevel, newXp: currentXp });
              setShowLevelUpPopup(true);
            }
          }
          
          return { ...t, done: newDone };
        }
        return t;
      });
      return updatedTasks;
    });
  };

  const addTask = (title: string, point: number, due?: string) => {
    setTasks(prev => [...prev, { id: uuid(), title, point, done: false, due }]);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const editTask = (id: string, newTitle: string, newPoint: number, newDue?: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, title: newTitle, point: newPoint, due: newDue } : t
    ));
  };

  // 期限延長機能
  const extendDeadline = (id: string, newDue: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, due: newDue } : t
    ));
  };

  // 期限切れタスクを取得
  const getOverdueTasks = () => {
    const now = new Date();
    return tasks.filter(t => !t.done && t.due && new Date(t.due) < now);
  };

  // 通常のタスク（期限切れでない）を取得
  const getActiveTasks = () => {
    const now = new Date();
    return tasks.filter(t => !t.done && (!t.due || new Date(t.due) >= now));
  };

  // レベルアップポップアップを閉じる
  const closeLevelUpPopup = () => {
    setShowLevelUpPopup(false);
    setLevelUpData(null);
  };

  // コレクション追加ポップアップを閉じる
  const closeCollectionPopup = () => {
    if (collectionCharacterId !== null) {
      // コレクションに実際に追加
      addToCollectionRef.current(collectionCharacterId);
      console.log(`Character ${collectionCharacterId} added to collection`);
      
      // 新しいキャラクターを抽選
      pickRandomCharacter();
    }
    
    setShowCollectionPopup(false);
    setCollectionCharacterId(null);
  };

  // メッセージをキューに追加する関数
  const addMessageToQueue = (message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: uuid()
    };
    setMessageQueue(prev => {
      // 同じタイプのメッセージが既にキューにある場合は追加しない
      const hasSameType = prev.some(msg => msg.type === message.type);
      if (hasSameType) {
        return prev;
      }
      return [...prev, newMessage];
    });
  };

  // メッセージキューを処理する関数
  useEffect(() => {
    if (messageQueue.length > 0 && !currentMessage) {
      const nextMessage = messageQueue[0];
      setCurrentMessage(nextMessage);
      setMessageQueue(prev => prev.slice(1));
      
      // 3秒後にメッセージを非表示にして次のメッセージを表示
      messageTimeoutRef.current = setTimeout(() => {
        setCurrentMessage(null);
      }, 3000);
    }
  }, [messageQueue, currentMessage]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  return {
    tasks,
    isLoading,
    xp,
    level,
    hp,
    currentMessage,
    messageQueue,
    overdueTasks,
    showOverdueNotification,
    showLevelUpPopup,
    levelUpData,
    // コレクション追加ポップアップ関連
    showCollectionPopup,
    collectionCharacterId,
    // キャラクター関連の値
    selectedCharacter,
    hasSelectedCharacter,
    getCurrentGif,
    resetCharacterSelection,
    // コレクション関連の値
    getCollectionStats,
    collection,
    toggleTask,
    addTask,
    deleteTask,
    editTask,
    extendDeadline,
    getOverdueTasks,
    getActiveTasks,
    closeLevelUpPopup,
    closeCollectionPopup,
    // HP操作関数もエクスポート
    decreaseHp,
    healHp,
    resetHp,
  };
} 