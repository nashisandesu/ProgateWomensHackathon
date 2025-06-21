import { useState } from 'react';
import type { Task } from '../types';

interface TaskSearchProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newTitle: string, newPoint: number, newDue?: string) => void;
}

export function TaskSearch({ tasks, onToggleTask, onDeleteTask, onEditTask }: TaskSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPoint, setEditPoint] = useState(10);
  const [editDue, setEditDue] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  // 検索フィルタリング
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.due && new Date(task.due).toLocaleDateString().includes(searchQuery))
  );

  // 完了・未完了でグループ化
  const incompleteTasks = filteredTasks.filter(task => !task.done);
  const completedTasks = filteredTasks.filter(task => task.done);

  const handleEdit = (task: Task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditPoint(task.point);
    setEditDue(task.due || '');
    setShowMenu(null);
  };

  const handleSaveEdit = () => {
    if (editingTask) {
      onEditTask(editingTask, editTitle, editPoint, editDue);
      setEditingTask(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  return (
    <div className="absolute bottom-4 right-4">
      {/* 検索ボタン */}
      <button
        className="nes-btn is-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        🔍 検索
      </button>

      {/* 検索ポップアップ */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black p-6 w-11/12 h-5/6 max-w-4xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">
                タスク検索
              </h3>
              <button
                className="nes-btn"
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
                  <h4 className="text-lg font-bold mb-3 border-b-2 border-blue-500 pb-1">
                    未完了タスク ({incompleteTasks.length})
                  </h4>
                  <ul className="space-y-2">
                    {incompleteTasks.map(task => (
                      <li key={task.id} className="bg-blue-50 p-3 rounded border-2 border-blue-300">
                        {editingTask === task.id ? (
                          <div className="space-y-2">
                            <input
                              className="nes-input"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="タスク名"
                            />
                            <input
                              type="number"
                              className="nes-input"
                              min={5}
                              max={100}
                              step={5}
                              value={editPoint}
                              onChange={(e) => setEditPoint(Number(e.target.value))}
                            />
                            <input
                              type="date"
                              className="nes-input"
                              value={editDue}
                              onChange={(e) => setEditDue(e.target.value)}
                            />
                            <div className="flex space-x-2">
                              <button className="nes-btn is-success" onClick={handleSaveEdit}>
                                保存
                              </button>
                              <button className="nes-btn" onClick={handleCancelEdit}>
                                キャンセル
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-lg">{task.title}</span>
                              <div className="text-sm text-gray-600">
                                {task.due && `期限: ${new Date(task.due).toLocaleDateString()}`}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="nes-badge"><span className="is-dark">{task.point}pt</span></span>
                              <button
                                className="nes-btn is-success w-20 h-10"
                                onClick={() => onToggleTask(task.id)}
                              >
                                完了
                              </button>
                              <div className="relative">
                                <button
                                  className="nes-btn"
                                  onClick={() => setShowMenu(showMenu === task.id ? null : task.id)}
                                >
                                  ⋯
                                </button>
                                {showMenu === task.id && (
                                  <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black p-2 z-10">
                                    <div className="flex space-x-2">
                                      <button
                                        className="nes-btn whitespace-nowrap"
                                        onClick={() => handleEdit(task)}
                                      >
                                        編集
                                      </button>
                                      <button
                                        className="nes-btn is-error whitespace-nowrap"
                                        onClick={() => {
                                          onDeleteTask(task.id);
                                          setShowMenu(null);
                                        }}
                                      >
                                        削除
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
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
                      <li key={task.id} className="bg-green-50 p-3 rounded border-2 border-green-300">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="line-through opacity-50 text-lg">{task.title}</span>
                            <div className="text-sm text-gray-600">
                              {task.due && `期限: ${new Date(task.due).toLocaleDateString()}`}
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="nes-badge"><span className="is-dark">{task.point}pt</span></span>
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