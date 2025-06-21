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

  // タスクを完了させる
  const handleCompleteTask = (taskId: string) => {
    onToggleTask(taskId);
    setExtendingTask(null);
    setNewDeadline('');
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white border-4 border-red-400 rounded-lg p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-600 mb-4">
            期限切れタスクがあります！
          </h3>
          <p className="text-gray-700 mb-6">
            以下のタスクの期限が過ぎています：
          </p>
          
          <div className="space-y-3 mb-6">
            {overdueTasks.map(task => (
              <div key={task.id} className="bg-red-50 border-2 border-red-200 p-3 rounded">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-red-600">
                      期限: {new Date(task.due!).toLocaleDateString('ja-JP', {
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-600">経験値: {task.point}pt</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-800">
                      {task.point}pt
                    </span>
                    <button
                      className="nes-btn is-success text-sm py-1 px-2"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      完了
                    </button>
                  </div>
                </div>

                {/* 期限延長または削除の選択 */}
                {extendingTask === task.id ? (
                  <div className="flex space-x-2">
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
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      className="nes-btn is-warning text-sm py-1 px-2"
                      onClick={() => setExtendingTask(task.id)}
                    >
                      期限延長
                    </button>
                    <button
                      className="nes-btn is-error text-sm py-1 px-2"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 