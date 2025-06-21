import { useState } from 'react';
import type { Task } from '../types';

interface OverdueTaskManagerProps {
  overdueTasks: Task[];
  onExtendDeadline: (id: string, newDue: string) => void;
  onDeleteTask: (id: string) => void;
  onCompleteTask: (id: string) => void;
}

export function OverdueTaskManager({ 
  overdueTasks, 
  onExtendDeadline, 
  onDeleteTask, 
  onCompleteTask 
}: OverdueTaskManagerProps) {
  const [showManager, setShowManager] = useState(false);
  const [extendingTask, setExtendingTask] = useState<string | null>(null);
  const [newDeadline, setNewDeadline] = useState('');

  const handleExtendDeadline = (taskId: string) => {
    if (newDeadline) {
      onExtendDeadline(taskId, newDeadline);
      setExtendingTask(null);
      setNewDeadline('');
    }
  };

  const handleCancelExtend = () => {
    setExtendingTask(null);
    setNewDeadline('');
  };

  if (overdueTasks.length === 0) {
    return null;
  }

  return (
    <div className="absolute bottom-20 left-0">
      {/* 期限切れタスク管理ボタン */}
      <button
        className="relative focus:outline-none"
        onClick={() => setShowManager(!showManager)}
      >
        <div className="bg-red-500 text-white px-3 py-2 rounded-lg border-2 border-red-700 shadow-lg">
          <div className="text-sm font-bold">⚠️ 期限切れ</div>
          <div className="text-xs">({overdueTasks.length}件)</div>
        </div>
      </button>

      {/* 期限切れタスク管理ポップアップ */}
      {showManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150] p-4">
          <div className="bg-white border-4 border-red-400 rounded-lg p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-red-600">
                期限切れタスク管理
              </h3>
              <button
                className="nes-btn py-2"
                onClick={() => setShowManager(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {overdueTasks.map(task => (
                <div key={task.id} className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{task.title}</h4>
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
                      <button
                        className="nes-btn is-success text-sm py-1 px-2"
                        onClick={() => onCompleteTask(task.id)}
                      >
                        完了
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {extendingTask === task.id ? (
                      <div className="flex-1 flex space-x-2">
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
                      <>
                        <button
                          className="nes-btn is-warning text-sm py-1 px-2"
                          onClick={() => setExtendingTask(task.id)}
                        >
                          期限延長
                        </button>
                        <button
                          className="nes-btn is-error text-sm py-1 px-2"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          削除
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                className="nes-btn is-primary px-6 py-2"
                onClick={() => setShowManager(false)}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 