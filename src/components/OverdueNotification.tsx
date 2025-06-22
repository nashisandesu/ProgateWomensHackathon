import { useState } from 'react';
import type { Task } from '../types';

interface OverdueNotificationProps {
  overdueTasks: Task[];
  showNotification: boolean;
  onToggleTask: (id: string) => void;
  onExtendDeadline: (id: string, newDue: string) => void;
  onDeleteTask: (id: string) => void;
}

export function OverdueNotification({ 
  overdueTasks,
  showNotification,
  onToggleTask, 
  onExtendDeadline, 
  onDeleteTask
}: OverdueNotificationProps) {
  const [extendingTask, setExtendingTask] = useState<string | null>(null);
  const [newDeadline, setNewDeadline] = useState('');
  const [showConfirmPopup, setShowConfirmPopup] = useState<string | null>(null);

  // タスクを完了させる
  const handleCompleteTask = (taskId: string) => {
    onToggleTask(taskId);
    setExtendingTask(null);
    setNewDeadline('');
    setShowConfirmPopup(null);
  };

  // 期限延長を処理
  const handleExtendDeadline = (taskId: string) => {
    if (newDeadline) {
      onExtendDeadline(taskId, newDeadline);
      setExtendingTask(null);
      setNewDeadline('');
    }
  };

  // タスク削除を処理
  const handleDeleteTask = (taskId: string) => {
    onDeleteTask(taskId);
    setExtendingTask(null);
    setNewDeadline('');
  };

  // 期限延長モードをキャンセル
  const handleCancelExtend = () => {
    setExtendingTask(null);
    setNewDeadline('');
  };

  if (!showNotification || overdueTasks.length === 0) {
    return null;
  }

  // タスクを期限ごとにグループ化
  const groupedTasks = overdueTasks.reduce((groups, task) => {
    const dueDate = new Date(task.due!).toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    if (!groups[dueDate]) {
      groups[dueDate] = [];
    }
    groups[dueDate].push(task);
    return groups;
  }, {} as Record<string, typeof overdueTasks>);

  // 期限順にソート
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
        <div className="bg-white border-4 border-red-400 rounded-lg p-4 lg:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="text-3xl lg:text-4xl mb-4">⚠️</div>
            <h3 className="text-lg lg:text-xl font-bold text-red-600 mb-2">
              期限切れタスクがあります！
            </h3>
            <p className="text-gray-700 text-sm lg:text-base">
              以下のタスクの期限が過ぎています：
            </p>
          </div>
          
          <div className="space-y-4">
            {sortedDates.map(dueDate => (
              <div key={dueDate} className="mb-4">
                <h3 className="text-lg font-bold mb-2 border-b-2 border-red-300 pb-1 text-red-600">
                  {dueDate}
                </h3>
                <ul className="space-y-3">
                  {groupedTasks[dueDate].map(task => (
                    <li
                      key={task.id}
                      className="border-2 border-red-300 p-3 rounded-lg shadow-sm bg-red-100"
                    >
                      <div className="w-full flex justify-between items-center gap-x-3 mb-3">
                        {/* Task Title */}
                        <div className="flex-1 min-w-0 flex items-center gap-x-2">
                          {/* 完了タスク用アイコン表示 */}
                          {task.done && (
                            <img
                              src="wood_piskel-2.png"
                              alt="完了"
                              className="w-6 h-6 inline-block"
                            />
                          )}
                          <p className="text-gray-800 break-words font-medium">
                            {task.title}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex-shrink-0 flex items-center space-x-2">
                          <span className="text-sm font-black text-gray-800 w-12 text-right">
                            {task.point}pt
                          </span>
                          <button
                            className="nes-btn is-success !h-auto !py-2 !px-3 text-sm"
                            onClick={() => setShowConfirmPopup(task.id)}
                          >
                            完了
                          </button>
                        </div>
                      </div>

                      {/* 期限延長または削除の選択 */}
                      {extendingTask === task.id ? (
                        <div className="flex space-x-2 justify-center">
                          <input
                            type="datetime-local"
                            className="nes-input flex-1"
                            value={newDeadline}
                            onChange={(e) => setNewDeadline(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                          />
                          <button
                            className="nes-btn is-primary text-sm py-1 px-2"
                            onClick={() => handleExtendDeadline(task.id)}
                            disabled={!newDeadline}
                          >
                            延長
                          </button>
                          <button
                            className="nes-btn text-sm py-1 px-2"
                            onClick={handleCancelExtend}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2 justify-center">
                          <button
                            className="nes-btn is-warning text-sm py-1 px-2"
                            onClick={() => setExtendingTask(task.id)}
                          >
                            延長
                          </button>
                          <button
                            className="nes-btn is-error text-sm py-1 px-2"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            削除
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* かわいい確認ポップアップ */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white border-4 border-pink-300 rounded-lg p-4 lg:p-6 w-full max-w-sm mx-auto">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl mb-4">
                <img 
                  src="/cong.gif" 
                  alt="お祝い" 
                  className="w-12 h-12 mx-auto"
                />
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-pink-600 mb-4">
                タスク完了確認
              </h3>
              <p className="text-gray-700 mb-4 text-sm lg:text-base">
                「<span className="font-bold text-pink-500">
                  {overdueTasks.find(task => task.id === showConfirmPopup)?.title}
                </span>」を<br />
                完了しましたか？
              </p>
              <p className="text-red-600 mb-6 text-sm lg:text-base font-medium">
                ⚠️ 期限を過ぎているので、経験値は貯まりますがHPは回復しません。
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  className="nes-btn is-success px-4 lg:px-6 py-2 text-sm lg:text-base"
                  onClick={() => handleCompleteTask(showConfirmPopup)}
                >
                  ✨ 完了！
                </button>
                <button
                  className="nes-btn px-4 lg:px-6 py-2 text-sm lg:text-base"
                  onClick={() => setShowConfirmPopup(null)}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}