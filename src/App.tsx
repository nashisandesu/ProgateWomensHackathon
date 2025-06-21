import { useState } from 'react';
import type { CredentialResponse } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoginPage, CatCharacter, TaskList, AddTaskForm } from './components';
import { useTasks } from './hooks';
import { GOOGLE_CLIENT_ID } from './utils';

// --- メインのAppコンポーネント ---
export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <TodoQuest />
    </GoogleOAuthProvider>
  );
}

// --- ToDoアプリの本体 ---
function TodoQuest() {
  const [user, setUser] = useState<CredentialResponse | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const {
    tasks,
    xp,
    level,
    hp,
    xpGain,
    levelUp,
    toggleTask,
    addTask,
    deleteTask,
    editTask,
  } = useTasks();

  // ユーザー情報がない（ログインしていない）場合は、ログインページを表示
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  // ログイン済みの場合は、ToDoアプリ本体を表示
  return (
    <div className="flex flex-col lg:flex-row w-full h-full p-2 lg:p-4 gap-2 lg:gap-4 relative overflow-hidden">
      {/* ─ Left Cat Panel ─ */}
      <div className="w-full lg:w-1/2 h-auto lg:h-full min-h-[400px] lg:min-h-0">
        <CatCharacter
          level={level}
          xp={xp}
          hp={hp}
          xpGain={xpGain}
          levelUp={levelUp}
          tasks={tasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onEditTask={editTask}
        />
      </div>

      {/* ─ Right Task Panel ─ */}
      <div className="w-full lg:w-1/2 h-auto lg:h-full border-4 border-black p-2 lg:p-4 flex flex-col flex-1 min-h-[300px] lg:min-h-0">
        <h2 className="text-lg lg:text-xl mb-2 lg:mb-4">今日のタスク</h2>
        <TaskList
          tasks={tasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onEditTask={editTask}
        />
        {/* Add Task Button */}
        <button 
          className="nes-btn is-primary w-full mt-2 lg:mt-4 py-3 lg:py-2" 
          onClick={() => setShowAddForm(true)}
        >
          ＋ タスクを追加
        </button>
      </div>

      {/* Add Task Popup - より高いz-indexを使用 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-4 border-black p-4 lg:p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg lg:text-xl mb-4">新しいタスクを追加</h3>
            <AddTaskForm 
              onAdd={(title, point, due) => {
                addTask(title, point, due);
                setShowAddForm(false);
              }} 
            />
            <button 
              className="nes-btn mt-4 w-full py-3 lg:py-2" 
              onClick={() => setShowAddForm(false)}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
