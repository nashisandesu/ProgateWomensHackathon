import { useState } from 'react';
import type { Task } from '../types';
import { TaskItem } from './TaskList';
import { useTaskSort } from '../hooks/useTaskSort';

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
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 完了・未完了タスクに分離
  const incompleteTasks = filteredTasks.filter(task => !task.done);
  const completedTasks = filteredTasks.filter(task => task.done);

  // 期限順ソート機能を使用（未完了タスクと完了タスクそれぞれに適用）
  const { sortedTasks: sortedIncompleteTasks } = useTaskSort(incompleteTasks);
  const { sortedTasks: sortedCompletedTasks } = useTaskSort(completedTasks);

  return (
    <div className="absolute bottom-0 right-0">
      {/* 検索ボタン */}
      <button
        className="relative focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="bg-blue-500 text-white px-3 py-2 rounded-lg border-2 border-blue-700 shadow-lg">
          <div className="text-sm font-bold">🔍 検索</div>
        </div>
      </button>

      {/* 検索モーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[90] p-2 lg:p-4">
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
                placeholder="タスク名を入力して検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 検索結果 */}
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* 未完了タスク */}
              {sortedIncompleteTasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3 border-b-2 border-blue-500 pb-1">
                    未完了タスク ({sortedIncompleteTasks.length})
                  </h3>
                  
                  {/* 未完了タスクを日付ごとにグループ化 */}
                  {(() => {
                    const groupedIncompleteTasks = sortedIncompleteTasks.reduce((groups, task) => {
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
                    }, {} as Record<string, typeof sortedIncompleteTasks>);

                    // 期限順にソート（期限なしは最後）
                    const sortedDates = Object.keys(groupedIncompleteTasks).sort((a, b) => {
                      if (a === '期限なし') return 1;
                      if (b === '期限なし') return -1;
                      return new Date(a).getTime() - new Date(b).getTime();
                    });

                    return (
                      <div className="space-y-4">
                        {sortedDates.map(dueDate => (
                          <div key={dueDate}>
                            <h4 className="text-md font-bold mb-2 border-b border-blue-300 pb-1">
                              {dueDate}
                            </h4>
                            <ul className="space-y-2">
                              {groupedIncompleteTasks[dueDate].map(task => (
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
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 完了タスク */}
              {sortedCompletedTasks.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold mb-3 border-b-2 border-green-500 pb-1">
                    完了タスク ({sortedCompletedTasks.length})
                  </h4>
                  
                  {/* 完了タスクを日付ごとにグループ化 */}
                  {(() => {
                    const groupedCompletedTasks = sortedCompletedTasks.reduce((groups, task) => {
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
                    }, {} as Record<string, typeof sortedCompletedTasks>);

                    // 期限順にソート（期限なしは最後）
                    const sortedDates = Object.keys(groupedCompletedTasks).sort((a, b) => {
                      if (a === '期限なし') return 1;
                      if (b === '期限なし') return -1;
                      return new Date(b).getTime() - new Date(a).getTime();
                    });

                    return (
                      <div className="space-y-4">
                        {sortedDates.map(dueDate => (
                          <div key={dueDate}>
                            <h5 className="text-md font-bold mb-2 border-b border-green-300 pb-1">
                              {dueDate}
                            </h5>
                            <ul className="space-y-2">
                              {groupedCompletedTasks[dueDate].map(task => (
                                <li key={task.id} className="bg-green-50 p-3 rounded-lg border-2 border-green-300">
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
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 検索結果がない場合 */}
              {filteredTasks.length === 0 && searchQuery && (
                <div className="text-center text-gray-500 text-lg py-8">
                  「{searchQuery}」に一致するタスクが見つかりませんでした
                </div>
              )}

              {/* 検索クエリが空の場合 */}
              {!searchQuery && (
                <div className="text-center text-gray-500 text-lg py-8">
                  タスク名を入力して検索してください
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 