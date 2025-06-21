import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { v4 as uuid } from 'uuid';
import { MAX_HP } from '../utils/constants';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [xpGain, setXpGain] = useState<{ point: number; show: boolean }>({ point: 0, show: false });
  const [levelUp, setLevelUp] = useState<{ show: boolean }>({ show: false });
  const [hpLoss, setHpLoss] = useState<{ amount: number; show: boolean }>({ amount: 0, show: false });
  const [lastHpCheck, setLastHpCheck] = useState<number>(0);
  const [overdueHpLoss, setOverdueHpLoss] = useState<number>(0);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [showOverdueNotification, setShowOverdueNotification] = useState(false);

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
        console.log('HP減少検出:', newOverdueTasks.length, '件');
        setHpLoss({ amount: newOverdueTasks.length, show: true });
        setTimeout(() => setHpLoss({ amount: 0, show: false }), 3000);
        setOverdueHpLoss(prev => {
          const newLoss = prev + newOverdueTasks.length;
          console.log('HP損失更新:', prev, '→', newLoss);
          return newLoss;
        });
      }
      
      setLastHpCheck(now.getTime());
    };

    // 初回チェック
    checkOverdueTasks();

    // 1分ごとにチェック
    const interval = setInterval(checkOverdueTasks, 60000);

    return () => clearInterval(interval);
  }, [tasks, lastHpCheck]);

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
        setHpLoss({ amount: newOverdueTasks.length, show: true });
        setTimeout(() => setHpLoss({ amount: 0, show: false }), 3000);
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
            setHpLoss({ amount: newOverdueTasks.length, show: true });
            setTimeout(() => setHpLoss({ amount: 0, show: false }), 3000);
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

  // 経験値とレベル計算
  const xp = tasks.filter(t => t.done).reduce((sum, t) => sum + t.point, 0);
  const level = Math.floor(xp / 100) + 1;
  
  // HP計算：最大HPから累積のHP損失を引く
  const hp = Math.max(0, MAX_HP - overdueHpLoss);

  const toggleTask = (id: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(t => {
        if (t.id === id) {
          const wasDone = t.done;
          const newDone = !wasDone;
          
          // タスクが完了状態になった場合、経験値Getアニメーションを表示
          if (!wasDone && newDone) {
            const currentXp = tasks.filter(task => task.done).reduce((sum, task) => sum + task.point, 0);
            const newXp = currentXp + t.point;
            const currentLevel = Math.floor(currentXp / 100) + 1;
            const newLevel = Math.floor(newXp / 100) + 1;
            
            // レベルアップした場合
            if (newLevel > currentLevel) {
              setLevelUp({ show: true });
              setTimeout(() => setLevelUp({ show: false }), 3000);
            }
            
            setXpGain({ point: t.point, show: true });
            // 3秒後にアニメーションを非表示
            setTimeout(() => setXpGain(prev => ({ ...prev, show: false })), 3000);
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

  return {
    tasks,
    isLoading,
    xp,
    level,
    hp,
    xpGain,
    levelUp,
    hpLoss,
    overdueTasks,
    showOverdueNotification,
    toggleTask,
    addTask,
    deleteTask,
    editTask,
    extendDeadline,
    getOverdueTasks,
    getActiveTasks,
  };
} 