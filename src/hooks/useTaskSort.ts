import { useMemo } from 'react';
import type { Task } from '../types';

export function useTaskSort(tasks: Task[]) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // 期限なしのタスクは最後に配置
      if (!a.due && !b.due) return 0;
      if (!a.due) return 1;
      if (!b.due) return -1;
      
      // 期限順でソート
      return new Date(a.due).getTime() - new Date(b.due).getTime();
    });
  }, [tasks]);

  return {
    sortedTasks
  };
} 