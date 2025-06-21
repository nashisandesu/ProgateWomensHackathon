import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { v4 as uuid } from 'uuid';
import { MAX_HP } from '../utils/constants';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [xpGain, setXpGain] = useState<{ point: number; show: boolean }>({ point: 0, show: false });
  const [levelUp, setLevelUp] = useState<{ show: boolean }>({ show: false });

  // 初期ロード
  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('todoQuestTasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to load tasks from localStorage:", error);
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

  // 経験値とレベル計算
  const xp = tasks.filter(t => t.done).reduce((sum, t) => sum + t.point, 0);
  const level = Math.floor(xp / 100) + 1;
  const now = new Date();
  const overdueCount = tasks.filter(t => !t.done && t.due && new Date(t.due) < now).length;
  const hp = Math.max(0, MAX_HP - overdueCount);

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

  return {
    tasks,
    isLoading,
    xp,
    level,
    hp,
    xpGain,
    levelUp,
    toggleTask,
    addTask,
    deleteTask,
    editTask,
  };
} 