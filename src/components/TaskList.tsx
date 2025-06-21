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
    <li className="bg-gray-100 p-3 rounded-lg">
      <div className="w-full flex justify-between items-center gap-x-3">
        {/* Task Title */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 break-words">
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
            onClick={() => setShowConfirmPopup(true)}
          >
            完了
          </button>
          <div className="relative">
            <button
              className="nes-btn !h-auto !py-2 !px-2"
              onClick={() => setShowMenu(!showMenu)}
            >
              <span className="text-sm">︙</span>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black p-2 z-10 rounded shadow-lg">
                <div className="flex flex-col space-y-1">
                  <button
                    className="nes-btn whitespace-nowrap text-sm"
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                  >
                    ✏️ 編集
                  </button>
                  <button
                    className="nes-btn is-error whitespace-nowrap text-sm"
                    onClick={() => {
                      onDelete(task.id);
                      setShowMenu(false);
                    }}
                  >
                    🗑️ 削除
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* かわいい確認ポップアップ */}
      {showConfirmPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[85] p-4">
          <div className="bg-white border-4 border-pink-300 rounded-lg p-4 lg:p-6 w-full max-w-sm mx-auto">
            <div className="text-center">
              <div className="text-3xl lg:text-4xl mb-4">🎉</div>
              <h3 className="text-lg lg:text-xl font-bold text-pink-600 mb-4">
                タスク完了確認
              </h3>
              <p className="text-gray-700 mb-6 text-sm lg:text-base">
                「<span className="font-bold text-pink-500">{task.title}</span>」を<br />
                完了しましたか？
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  className="nes-btn is-success px-4 lg:px-6 py-2 text-sm lg:text-base"
                  onClick={() => {
                    onToggle(task.id);
                    setShowConfirmPopup(false);
                  }}
                >
                  ✨ 完了！
                </button>
                <button
                  className="nes-btn px-4 lg:px-6 py-2 text-sm lg:text-base"
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