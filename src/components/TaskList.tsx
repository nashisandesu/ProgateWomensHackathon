import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { calculateExperiencePoints } from '../utils/gemini';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newTitle: string, newPoint: number, newDue?: string) => void;
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string, newPoint: number, newDue?: string) => void;
}

function TaskItem({ task, onToggle, onDelete, onEdit }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPoint, setEditPoint] = useState(task.point);
  const [editDue, setEditDue] = useState(task.due || '');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditCalculating, setIsEditCalculating] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // 編集時のタスク名変更で経験値を自動計算
  useEffect(() => {
    if (isEditing && editTitle.trim()) {
      setIsEditCalculating(true);
      calculateExperiencePoints(editTitle.trim())
        .then(points => {
          setEditPoint(points);
          setIsEditCalculating(false);
        })
        .catch(() => {
          setIsEditCalculating(false);
        });
    }
  }, [editTitle, isEditing]);

  if (isEditing) {
    return (
      <li className="bg-gray-100 p-2 rounded">
        <div className="flex flex-col space-y-2 w-full">
          <input
            className="nes-input"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            placeholder="タスク名"
          />
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="nes-input flex-1"
              min={5}
              max={100}
              step={5}
              value={editPoint}
              onChange={e => setEditPoint(Number(e.target.value))}
              placeholder="ポイント"
              disabled={isEditCalculating}
            />
            {isEditCalculating && (
              <span className="text-sm text-gray-500">計算中...</span>
            )}
          </div>
          <input
            type="date"
            className="nes-input"
            value={editDue}
            onChange={e => setEditDue(e.target.value)}
          />
          <div className="flex space-x-2">
            <button
              className="nes-btn is-success"
              onClick={() => {
                onEdit(task.id, editTitle, editPoint, editDue);
                setIsEditing(false);
              }}
            >
              保存
            </button>
            <button
              className="nes-btn"
              onClick={() => setIsEditing(false)}
            >
              キャンセル
            </button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className="bg-gray-100 p-2 rounded">
      <div className="w-full">
        <div className="flex justify-between items-center">
          <div>
            <span>{task.title}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="nes-badge"><span className="is-dark">{task.point}pt</span></span>
            <button
              className="nes-btn is-success w-24 h-12"
              onClick={() => setShowConfirmPopup(true)}
            >
              完了
            </button>
            <div className="relative">
              <button
                className="nes-btn"
                onClick={() => setShowMenu(!showMenu)}
              >
                ⋯
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black p-2 z-10">
                  <div className="flex space-x-2">
                    <button
                      className="nes-btn whitespace-nowrap"
                      onClick={() => {
                        setIsEditing(true);
                        setShowMenu(false);
                      }}
                    >
                      編集
                    </button>
                    <button
                      className="nes-btn is-error whitespace-nowrap"
                      onClick={() => {
                        onDelete(task.id);
                        setShowMenu(false);
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
      </div>

      {/* かわいい確認ポップアップ */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-pink-300 rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-pink-600 mb-4">
                タスク完了確認
              </h3>
              <p className="text-gray-700 mb-6">
                「<span className="font-bold text-pink-500">{task.title}</span>」を<br />
                完了しましたか？
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  className="nes-btn is-success px-6 py-2"
                  onClick={() => {
                    onToggle(task.id);
                    setShowConfirmPopup(false);
                  }}
                >
                  ✨ 完了！
                </button>
                <button
                  className="nes-btn px-6 py-2"
                  onClick={() => setShowConfirmPopup(false)}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export function TaskList({ tasks, onToggleTask, onDeleteTask, onEditTask }: TaskListProps) {
  // 未完了のタスクのみをフィルタリング
  const incompleteTasks = tasks.filter(task => !task.done);
  
  // タスクを期限ごとにグループ化
  const groupedTasks = incompleteTasks.reduce((groups, task) => {
    const dueDate = task.due ? new Date(task.due).toLocaleDateString() : '期限なし';
    if (!groups[dueDate]) {
      groups[dueDate] = [];
    }
    groups[dueDate].push(task);
    return groups;
  }, {} as Record<string, typeof incompleteTasks>);

  // 期限順にソート（期限なしは最後）
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    if (a === '期限なし') return 1;
    if (b === '期限なし') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <ul className="flex-1 overflow-y-auto space-y-2">
      {sortedDates.map(dueDate => (
        <div key={dueDate} className="mb-4">
          <h3 className="text-lg font-bold mb-2 border-b-2 border-black pb-1">
            {dueDate}
          </h3>
          <div className="space-y-2">
            {groupedTasks[dueDate].map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
          </div>
        </div>
      ))}
    </ul>
  );
} 