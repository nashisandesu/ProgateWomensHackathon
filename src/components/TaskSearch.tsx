import { useState } from 'react';
import type { Task } from '../types';
import { TaskItem } from './TaskList';

interface TaskSearchProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newTitle: string, newPoint: number, newDue?: string) => void;
}

export function TaskSearch({ tasks, onToggleTask, onDeleteTask, onEditTask }: TaskSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 検索フィルタリング
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.due && new Date(task.due).toLocaleDateString().includes(searchQuery))
  );

  // 完了・未完了でグループ化
  const incompleteTasks = filteredTasks.filter(task => !task.done);
  const completedTasks = filteredTasks.filter(task => task.done);

  return (
    <div className="absolute bottom-1 right-1 lg:bottom-4 lg:right-4">
      {/* 検索ボタン */}
      <button
        className="nes-btn is-primary text-xs lg:text-sm py-1 lg:py-1 px-2 lg:px-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔍 検索
      </button>

      {/* 検索ポップアップ */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-2 lg:p-4">
          <div className="bg-white border-4 border-black p-4 lg:p-6 w-full h-full lg:w-11/12 lg:h-5/6 max-w-4xl max-h-[90vh] lg:max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl lg:text-2xl font-bold">
                タスク検索
              </h3>
              <button
                className="nes-btn py-2 lg:py-1"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* 検索入力 */}
            <div className="mb-4">
              <input
                type="text"
                className="nes-input w-full"
                placeholder="タスク名や日付で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 検索結果 */}
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* 未完了タスク */}
              {incompleteTasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3 border-b-2 border-blue-500 pb-1">
                    未完了タスク ({incompleteTasks.length})
                  </h3>
                  <ul className="space-y-2">
                    {incompleteTasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                        onEdit={onEditTask}
                      />
                    ))}
                  </ul>
                </div>
              )}

              {/* 完了タスク */}
              {completedTasks.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-3 border-b-2 border-green-500 pb-1">
                    完了タスク ({completedTasks.length})
                  </h4>
                  <ul className="space-y-2">
                    {completedTasks.map(task => (
                      <li key={task.id} className="bg-green-50 p-3 rounded-lg border-2 border-green-300">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="line-through opacity-50 text-lg">{task.title}</span>
                            <div className="text-sm text-gray-600">
                              {task.due && `期限: ${new Date(task.due).toLocaleDateString()}`}
                            </div>
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
              )}

              {/* 検索結果がない場合 */}
              {filteredTasks.length === 0 && searchQuery && (
                <div className="text-center text-gray-500 py-8">
                  検索結果が見つかりませんでした
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 