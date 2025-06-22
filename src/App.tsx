import { useState } from 'react';
import type { TokenResponse } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoginPage, CatCharacter, TaskList, AddTaskForm, OverdueNotification, LevelUpPopup, CollectionScreen } from './components';
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
  const [user, setUser] = useState<TokenResponse | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCollection, setShowCollection] = useState(false);
  
  const {
    tasks,
    xp,
    level,
    hp,
    currentMessage,
    overdueTasks,
    showOverdueNotification,
    showLevelUpPopup,
    levelUpData,
    // キャラクター関連の値
    selectedCharacter,
    hasSelectedCharacter,
    getCurrentGif,
    // コレクション関連の値
    collection,
    toggleTask,
    addTask,
    deleteTask,
    editTask,
    extendDeadline,
    closeLevelUpPopup,
  } = useTasks();

  // ユーザー情報がない（ログインしていない）場合は、ログインページを表示
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  // ログイン済みの場合は、ToDoアプリ本体を表示
  return (
    <div className="flex flex-col lg:flex-row w-full h-full p-2 lg:p-4 gap-2 lg:gap-4 relative overflow-hidden">
      {/* ─ Left Cat Panel ─ */}
      <div className="w-full lg:w-1/2 h-auto lg:h-full">
        <CatCharacter
          level={level}
          xp={xp}
          hp={hp}
          currentMessage={currentMessage}
          tasks={tasks}
          selectedCharacter={selectedCharacter}
          hasSelectedCharacter={hasSelectedCharacter}
          getCurrentGif={getCurrentGif}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onEditTask={editTask}
        />
      </div>

      {/* ─ Right Task Panel ─ */}
      <div className="w-full lg:w-1/2 h-auto lg:h-full border-4 border-black p-2 lg:p-4 flex flex-col overflow-hidden">
        <TaskList
          tasks={tasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
          onEditTask={editTask}
        />
      </div>

      {/* Floating Add Task Button - 右下に配置 */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center text-2xl lg:text-3xl shadow-lg transition-all duration-200 z-50"
        style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
      >
        +
      </button>

      {/* Floating Collection Button - 左下に配置 */}
      <button
        onClick={() => setShowCollection(true)}
        className="fixed bottom-4 left-4 lg:bottom-8 lg:left-8 bg-purple-500 hover:bg-purple-600 text-white rounded-full w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center text-2xl lg:text-3xl shadow-lg transition-all duration-200 z-50"
        style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
        title="コレクション"
      >
        📚
      </button>

      {/* Add Task Form Modal */}
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

      {/* Collection Screen Modal */}
      {showCollection && (
        <CollectionScreen
          collection={collection}
          onClose={() => setShowCollection(false)}
        />
      )}

      {/* Overdue Notification */}
      <OverdueNotification 
        overdueTasks={overdueTasks}
        showNotification={showOverdueNotification}
        onToggleTask={toggleTask}
        onExtendDeadline={extendDeadline}
        onDeleteTask={deleteTask}
      />

      {/* Level Up Popup */}
      <LevelUpPopup
        show={showLevelUpPopup}
        levelUpData={levelUpData}
        getCurrentGif={getCurrentGif}
        onClose={closeLevelUpPopup}
      />
    </div>
  );
}
