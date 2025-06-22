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
  const [overdueHpLoss, setOverdueHpLoss] = useState<number>(0);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [showOverdueNotification, setShowOverdueNotification] = useState(false);
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; newXp: number } | null>(null);
  
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
  const { addToCollection, getCollectionStats } = useCollection();

  // 経験値とレベル計算（キャラクター選択ロジックより前に配置）
  const xp = tasks.filter(t => t.done).reduce((sum, t) => sum + t.point, 0);
  const level = Math.floor(xp / 100) + 1;
  
  // HP計算：最大HPから累積のHP損失を引く
  const hp = Math.max(0, MAX_HP - overdueHpLoss);

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

    console.log("Character selection check:", {
      level,
      prev,
      isLevelUp,
      isPickTiming,
      hasSelectedCharacter,
    });

    if (!hasSelectedCharacter) {
      // 初回
      pickRandomCharacter();
    } else if (isLevelUp && isPickTiming) {
      // レベル到達トリガ
      pickRandomCharacter();
    }

    previousLevelRef.current = level;
  }, [level, hasSelectedCharacter]);

  // コレクション追加ロジック：レベル5の倍数でコレクションに追加
  useEffect(() => {
    if (selectedCharacter !== null && level > 0 && level % 5 === 0) {
      // レベル5の倍数に達した場合、コレクションに追加
      addToCollection(selectedCharacter, level);
      console.log(`Character ${selectedCharacter} added to collection at level ${level}`);
    }
  }, [level, selectedCharacter, addToCollection]);

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
        setOverdueHpLoss(initialOverdueTasks.length);
        setOverdueTasks(initialOverdueTasks);
        if (initialOverdueTasks.length > 0) {
          setShowOverdueNotification(true);
        }
      }
      
      // HP損失もlocalStorageから読み込み（上書きされる可能性があるため後で処理）
      const storedHpLoss = localStorage.getItem('todoQuestHpLoss');
      if (storedHpLoss) {
        const storedLoss = JSON.parse(storedHpLoss);
        // 保存されたHP損失と計算されたHP損失の大きい方を採用
        setOverdueHpLoss(prev => Math.max(prev, storedLoss));
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

  // HP損失の保存
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('todoQuestHpLoss', JSON.stringify(overdueHpLoss));
      } catch (error) {
        console.error("Failed to save HP loss to localStorage:", error);
      }
    }
  }, [overdueHpLoss, isLoading]);

  // 統一された期限切れタスクのチェックとHP減少
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
      
      // 新しい期限切れタスクがある場合、HP減少アニメーションを表示し、HP損失を記録
      if (newOverdueTasks.length > 0) {
        addMessageToQueue({ type: 'hpLoss', content: `HP -${newOverdueTasks.length} 💔`, amount: newOverdueTasks.length });
        setOverdueHpLoss(prev => {
          const newLoss = prev + newOverdueTasks.length;
          return newLoss;
        });
        setLastHpCheck(now.getTime());
      }
    };

    // 初回チェック
    checkOverdueTasks();

    // 10秒ごとにチェック
    const interval = setInterval(checkOverdueTasks, 10000);

    return () => clearInterval(interval);
  }, [tasks, lastHpCheck, isLoading]);

  // リアルタイム期限切れチェック（より頻繁にチェック）
  useEffect(() => {
    const checkRealTimeOverdue = () => {
      const now = new Date();
      const overdueTasks = tasks.filter(t => !t.done && t.due && new Date(t.due) < now);
      
      // 前回のチェック以降に期限切れになったタスクを検出
      const newOverdueTasks = overdueTasks.filter(task => 
        new Date(task.due!).getTime() > lastHpCheck
      );
      
      // 期限切れタスクの状態を更新
      setOverdueTasks(overdueTasks);
      setShowOverdueNotification(overdueTasks.length > 0);
      
      // 新しい期限切れタスクがある場合、HP減少アニメーションを表示し、HP損失を記録
      if (newOverdueTasks.length > 0) {
        addMessageToQueue({ type: 'hpLoss', content: `HP -${newOverdueTasks.length} 💔`, amount: newOverdueTasks.length });
        setOverdueHpLoss(prev => prev + newOverdueTasks.length);
        setLastHpCheck(now.getTime());
      }
    };

    // 10秒ごとにリアルタイムチェック
    const realTimeInterval = setInterval(checkRealTimeOverdue, 10000);

    return () => clearInterval(realTimeInterval);
  }, [tasks, lastHpCheck]);

  // 期限切れ直前のタスクを監視（1秒ごとにチェック）
  useEffect(() => {
    const checkImminentOverdue = () => {
      const now = new Date();
      const oneMinuteFromNow = new Date(now.getTime() + 60000); // 1分後
      
      // 1分以内に期限が切れるタスクを検出
      const imminentOverdueTasks = tasks.filter(t => 
        !t.done && 
        t.due && 
        new Date(t.due) > now && 
        new Date(t.due) <= oneMinuteFromNow
      );
      
      // 期限切れ直前のタスクがある場合、より頻繁にチェック
      if (imminentOverdueTasks.length > 0) {
        const checkOverdue = () => {
          const currentTime = new Date();
          const overdueTasks = tasks.filter(t => !t.done && t.due && new Date(t.due) < currentTime);
          
          const newOverdueTasks = overdueTasks.filter(task => 
            new Date(task.due!).getTime() > lastHpCheck
          );
          
          // 期限切れタスクの状態を更新
          setOverdueTasks(overdueTasks);
          setShowOverdueNotification(overdueTasks.length > 0);
          
          if (newOverdueTasks.length > 0) {
            addMessageToQueue({ type: 'hpLoss', content: `HP -${newOverdueTasks.length} 💔`, amount: newOverdueTasks.length });
            setOverdueHpLoss(prev => prev + newOverdueTasks.length);
            setLastHpCheck(currentTime.getTime());
          }
        };
        
        // 1秒ごとにチェック
        const immediateInterval = setInterval(checkOverdue, 1000);
        
        // 1分後にクリーンアップ
        setTimeout(() => clearInterval(immediateInterval), 60000);
        
        return () => clearInterval(immediateInterval);
      }
    };

    // 30秒ごとに期限切れ直前のタスクをチェック
    const imminentInterval = setInterval(checkImminentOverdue, 30000);

    return () => clearInterval(imminentInterval);
  }, [tasks, lastHpCheck]);

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
            
            // レベルアップした場合はポップアップを表示
            if (currentLevel > previousLevel) {
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
    // キャラクター関連の値
    selectedCharacter,
    hasSelectedCharacter,
    getCurrentGif,
    resetCharacterSelection,
    // コレクション関連の値
    getCollectionStats,
    toggleTask,
    addTask,
    deleteTask,
    editTask,
    extendDeadline,
    getOverdueTasks,
    getActiveTasks,
    closeLevelUpPopup,
  };
} 