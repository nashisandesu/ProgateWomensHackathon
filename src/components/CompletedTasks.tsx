import { useState } from 'react';
import type { Task } from '../types';
import { useTaskSort } from '../hooks/useTaskSort';

interface CompletedTasksProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
}

export function CompletedTasks({ tasks, onToggleTask }: CompletedTasksProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const completedTasks = tasks.filter(task => task.done);
  const completedCount = completedTasks.length;

  // 期限順ソート機能を使用
  const { sortedTasks } = useTaskSort(completedTasks);

  // 完了したタスクを日付ごとにグループ化
  const groupedCompletedTasks = sortedTasks.reduce((groups, task) => {
    const dueDate = task.due ? new Date(task.due).toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '期限なし';
    if (!groups[dueDate]) {
      groups[dueDate] = [];
    }
    groups[dueDate].push(task);
    return groups;
  }, {} as Record<string, typeof sortedTasks>);

  // 日付順にソート（期限なしは最後）
  const sortedDates = Object.keys(groupedCompletedTasks).sort((a, b) => {
    if (a === '期限なし') return 1;
    if (b === '期限なし') return -1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="absolute bottom-0 left-0">
      {/* 完了タスクボタン */}
      <button
        className="relative focus:outline-none ml-4" // ← -ml-4 を ml-4 に変更
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src="wood_piskel-2.png" className="w-16 lg:w-20 xl:w-24" alt="wood" />
      </button>

      {/* 完了タスク一覧 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-2 lg:p-4">
          <div className="bg-white border-4 border-black p-4 lg:p-6 w-full h-full lg:w-11/12 lg:h-5/6 max-w-4xl max-h-[90vh] lg:max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              {/* 完了したタスクのタイトルは削除 */}
              <button
                className="nes-btn py-2 lg:py-1"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* 完了タスク一覧 */}
            <div className="flex-1 overflow-y-auto space-y-6">
              {completedCount === 0 ? (
                <div className="text-center text-gray-500 text-lg py-8">
                  完了したタスクはありません
                </div>
              ) : (
                sortedDates.map(dueDate => (
                  <div key={dueDate}>
                    <h4 className="text-lg font-bold mb-3 border-b-2 border-green-500 pb-1">
                      {dueDate}
                    </h4>
                    <ul className="space-y-2">
                      {groupedCompletedTasks[dueDate].map(task => (
                        <li key={task.id} className="bg-green-50 p-3 rounded border-2 border-green-300">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="line-through opacity-50 text-lg">{task.title}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-black text-gray-800 w-12 text-right">
                                {task.point}pt
                              </span>
                              <button
                                className="nes-btn is-warning w-28 h-12"
                                onClick={() => onToggleTask(task.id)}
                              >
                                取り消し
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}