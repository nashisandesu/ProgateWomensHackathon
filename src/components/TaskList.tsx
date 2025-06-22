import { useState, useEffect } from 'react';
import type { Task } from '../types';
import { calculateExperiencePoints } from '../utils/gemini'; // gemini.tsへの正しいパス
import { useTaskSort } from '../hooks/useTaskSort'; // TaskListで使われるため、ここではコメントアウトしません

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
  const [editTitleError, setEditTitleError] = useState('');
  const [editDueError, setEditDueError] = useState('');

  // 編集時のタスク名変更で経験値を自動計算 (デバウンス処理をここに適用)
  useEffect(() => {
    // isEditingがtrue（編集モード）かつ、editTitleに何か入力がある場合のみ実行
    if (isEditing && editTitle.trim()) {
      setIsEditCalculating(true); // 計算中表示をアクティブにする

      // デバウンスタイマーを設定
      // ユーザーの入力が止まってから1000ミリ秒（1秒）後にAPIを呼び出す
      const handler = setTimeout(() => {
        calculateExperiencePoints(editTitle.trim()) // Gemini API呼び出し
          .then(points => {
            setEditPoint(points); // 取得した経験値をセット
          })
          .catch(error => {
            console.error("経験値計算中にエラーが発生しました:", error);
            // エラー時もデフォルト値を表示するなど、ユーザーに分かりやすくする
            setEditPoint(15); 
          })
          .finally(() => {
            setIsEditCalculating(false); // 計算中表示を非アクティブにする
          });
      }, 1000); // ★★★ ここを 1000ミリ秒 (1秒) に設定 ★★★

      // クリーンアップ関数: 新しい入力があれば、前のタイマーをクリアする
      // これが、ユーザーが連続して入力している間にAPI呼び出しを抑制するキーポイントです
      return () => {
        clearTimeout(handler);
      };
    } else if (isEditing && !editTitle.trim()) {
      // 編集モードでタスク名が空になった場合、経験値をデフォルト値に戻す
      setEditPoint(15);
      setIsEditCalculating(false); // 計算も停止
    }
  }, [editTitle, isEditing]); // editTitle または isEditing が変更された時にこのEffectを再実行

  // 編集開始時の初期化
  const handleStartEdit = () => {
    setIsEditing(true);
    setShowMenu(false); // メニューを閉じる
    setEditTitleError(''); // エラーをクリア
    setEditDueError(''); // エラーをクリア
    // 編集開始時にも現在のタイトルで経験値を再計算させたい場合は
    // setDebouncedTaskTitle(task.title) のような処理を追加することも検討
  };

  // 編集時のタスク名変更処理
  const handleEditTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditTitle(value); // editTitle をすぐに更新
    if (value.trim()) {
      setEditTitleError(''); // エラーがある場合はクリア
    }
  };

  // 編集時の期限変更処理
  const handleEditDueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value;
    setEditDue(selectedValue);
    
    if (!selectedValue) {
      setEditDueError('');
      return;
    }
    
    const selectedDate = new Date(selectedValue);
    const now = new Date();
    
    // 過去の日付を選択できないようにするバリデーション
    if (selectedDate < now) {
      setEditDueError('過去の日時は選択できません');
    } else {
      setEditDueError('');
    }
  };

  // 編集保存処理
  const handleSaveEdit = () => {
    // タスク名の検証
    if (!editTitle.trim()) {
      setEditTitleError('タスク名を入力してください');
      return;
    }
    
    if (editDueError) return; // 期限にエラーがあれば保存しない
    
    onEdit(task.id, editTitle, editPoint, editDue); // 親コンポーネントに保存を通知
    setIsEditing(false); // 編集モードを終了
    setEditTitleError(''); // エラーをクリア
    setEditDueError(''); // エラーをクリア
  };

  // 期限切れ判定
  const isOverdue = !task.done && task.due && new Date(task.due) < new Date();

  // 編集モード時のUI
  if (isEditing) {
    return (
      <li className="bg-blue-50 border-2 border-blue-300 p-2 rounded">
        <div className="flex flex-col space-y-2 w-full">
          <div>
            <input
              className={`nes-input w-full ${editTitleError ? 'border-red-500' : ''}`}
              value={editTitle}
              onChange={handleEditTitleChange} // 入力変更ハンドラー
              placeholder="タスク名"
            />
            {editTitleError && (
              <p className="text-xs text-red-500 mt-1">
                {editTitleError}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              className="nes-input flex-1"
              min={5}
              max={100}
              step={5}
              value={editPoint} // 自動計算された経験値を表示
              onChange={e => setEditPoint(Number(e.target.value))} // 手動変更も可能にする場合
              placeholder="ポイント"
              disabled={isEditCalculating} // 計算中は無効化
            />
            {isEditCalculating && (
              <span className="text-sm text-gray-500">計算中...</span>
            )}
          </div>
          <div>
            <input
              type="datetime-local"
              className={`nes-input w-full ${editDueError ? 'border-red-500' : ''}`}
              value={editDue}
              onChange={handleEditDueChange}
            />
            {editDueError && (
              <p className="text-xs text-red-500 mt-1">
                {editDueError}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              className="nes-btn is-success"
              onClick={handleSaveEdit}
              disabled={!!editTitleError || !!editDueError} // エラーがあれば保存ボタンを無効化
            >
              保存
            </button>
            <button
              className="nes-btn"
              onClick={() => {
                setIsEditing(false); // 編集モードを終了
                setEditTitleError(''); // エラーをクリア
                setEditDueError(''); // エラーをクリア
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      </li>
    );
  }

  // 通常表示モード時のUI
  return (
    <li
      className={`border-2 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        isOverdue ? 'bg-red-100 border-red-300' : 'bg-blue-50 border-blue-400'
      }`}
    >
      <div className="w-full flex justify-between items-center gap-x-3">
        {/* Task Title */}
        <div className="flex-1 min-w-0">
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
            onClick={() => setShowConfirmPopup(true)} // 完了確認ポップアップを表示
          >
            完了
          </button>
          <div className="relative">
            <button
              className="nes-btn !h-auto !py-2 !px-2"
              onClick={() => setShowMenu(!showMenu)} // メニューの表示/非表示を切り替え
            >
              <span className="text-sm">︙</span>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black p-2 z-10 rounded shadow-lg">
                <div className="flex flex-col space-y-1">
                  <button
                    className="nes-btn whitespace-nowrap text-sm"
                    onClick={handleStartEdit} // 編集開始
                  >
                    ✏️ 編集
                  </button>
                  <button
                    className="nes-btn is-error whitespace-nowrap text-sm"
                    onClick={() => {
                      onDelete(task.id); // タスク削除
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
              <p className="text-gray-700 mb-6 text-sm lg:text-base">
                「<span className="font-bold text-pink-500">{task.title}</span>」を<br />
                完了しましたか？
              </p>
              <div className="flex space-x-4 justify-center">
                <button
                  className="nes-btn is-success px-4 lg:px-6 py-2 text-sm lg:text-base"
                  onClick={() => {
                    onToggle(task.id); // タスク完了/未完了を切り替え
                    setShowConfirmPopup(false); // ポップアップを閉じる
                  }}
                >
                  ✨ 完了！
                </button>
                <button
                  className="nes-btn px-4 lg:px-6 py-2 text-sm lg:text-base"
                  onClick={() => setShowConfirmPopup(false)} // ポップアップを閉じる
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

// TaskList コンポーネント (変更なし)
export function TaskList({ tasks, onToggleTask, onDeleteTask, onEditTask }: TaskListProps) {
  // useTaskSort フックをここで使用
  const { sortedTasks } = useTaskSort(tasks); // 恐らくtask.doneに関わらずソートしたいため、引数はtasks全体に修正

  // 未完了のタスクのみをフィルタリング（期限切れは除外）
  const now = new Date();
  const incompleteTasks = sortedTasks.filter(task => // sortedTasksからフィルタリング
    !task.done && (!task.due || new Date(task.due) >= now)
  );
  
  // 今日の日付を取得
  const today = new Date();
  
  // 今日のタスクと明日以降のタスクを分離
  const todayTasks = incompleteTasks.filter(task => { // incompleteTasksからフィルタリング
    if (!task.due) return false;
    const taskDate = new Date(task.due);
    return taskDate.toDateString() === today.toDateString();
  });
  
  const futureTasks = incompleteTasks.filter(task => { // incompleteTasksからフィルタリング
    if (!task.due) return true; // 期限なしは未来のタスクとして扱う
    const taskDate = new Date(task.due);
    return taskDate.toDateString() !== today.toDateString();
  });
  
  // 今日のタスクセクションのタイトルを生成
  // 期限が複数ある場合は最初のタスクの期限を表示するように修正
  const todayString = todayTasks.length > 0 
    ? `${today.getMonth() + 1}/${today.getDate()} ${new Date(todayTasks[0].due!).getHours().toString().padStart(2, '0')}:${new Date(todayTasks[0].due!).getMinutes().toString().padStart(2, '0')}`
    : `${today.getMonth() + 1}/${today.getDate()}`;
  
  // 明日以降のタスクを期限ごとにグループ化
  const groupedFutureTasks = futureTasks.reduce((groups, task) => {
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
  }, {} as Record<string, typeof futureTasks>);

  // 期限順にソート（期限なしは最後）
  const sortedDates = Object.keys(groupedFutureTasks).sort((a, b) => {
    if (a === '期限なし') return 1;
    if (b === '期限なし') return -1;
    return new Date(a).getTime() - new Date(b).getTime();
  });

  return (
    <ul className="flex-1 overflow-y-auto space-y-2 max-h-full">
      {/* 今日のタスクセクション */}
      <div className="mb-4">
        <h2 className="text-lg font-bold mb-2 pb-1">Today</h2>
        <h3 className="text-lg font-bold mb-2 border-b-2 border-black pb-1">
          {todayString}
        </h3>
        {todayTasks.length > 0 ? (
          <div className="space-y-2">
            {todayTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggleTask}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg border-2 border-gray-200">
            <p className="text-sm">今日のタスクはありません</p>
          </div>
        )}
      </div>

      {/* 明日以降のタスクセクション */}
      {sortedDates.length > 0 && (
        <>
          {sortedDates.map(dueDate => (
            <div key={dueDate} className="mb-4">
              <h3 className="text-lg font-bold mb-2 border-b-2 border-black pb-1">
                {dueDate}
              </h3>
              <div className="space-y-2">
                {groupedFutureTasks[dueDate].map(task => (
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
        </>
      )}
    </ul>
  );
}

export { TaskItem };