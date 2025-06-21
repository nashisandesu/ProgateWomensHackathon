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
    <div className="flex flex-col md:flex-row w-full h-full p-4 gap-4">
      {/* ─ Center Cat ─ */}
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

      {/* ─ Right Task Panel ─ */}
      <div className="w-full md:w-1/2 h-auto md:h-full border-4 border-black p-4 flex flex-col flex-1">
        <h2 className="text-xl mb-4">今日のタスク</h2>
        <TaskList
          tasks={tasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onEditTask={editTask}
        />
        {/* Add Task Button */}
        <button 
          className="nes-btn is-primary w-full mt-4" 
          onClick={() => setShowAddForm(true)}
        >
          ＋ タスクを追加
        </button>
      </div>

      {/* Add Task Popup */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black p-6 max-w-md w-full mx-4">
            <h3 className="text-xl mb-4">新しいタスクを追加</h3>
            <AddTaskForm 
              onAdd={(title, point, due) => {
                addTask(title, point, due);
                setShowAddForm(false);
              }} 
            />
            <button 
              className="nes-btn mt-4 w-full" 
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
