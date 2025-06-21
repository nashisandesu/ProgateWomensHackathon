import { useState } from 'react';
import type { Task } from './types';
import { v4 as uuid } from 'uuid';
// --- Google認証関連のライブラリをインポート ---
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';

const HEART = '💙';
const MAX_HP = 5;

// クライアントIDは、環境変数などを使って管理するのが推奨されます。
// 今回は直接記述します。
const GOOGLE_CLIENT_ID = "527828076351-j8ajmuudb77dkmt7jrd4j4l791fpbvsh.apps.googleusercontent.com";

// --- AddTaskFormコンポーネント（変更なし） ---
function AddTaskForm({ onAdd }: { onAdd: (title: string, point: number,due?:string) => void }) {
  const [title, setTitle] = useState('');
  const [point, setPoint] = useState<number>(10);
  const [due,setDue]= useState('');
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(title.trim(), point, due);
        setTitle('');
        setPoint(10);
        setDue('');
      }}
      className="mt-2 flex flex-col space-y-2"
    >
      <input
        className="nes-input"
        placeholder="タスク名"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <input
        type="number"
        className="nes-input"
        min={5}
        max={100}
        step={5}
        value={point}
        onChange={e => setPoint(Number(e.target.value))}
      />
      <input
        type="date"
        className="nes-input"
        value={due}
        onChange={e => setDue(e.target.value)}
      />
      <button className="nes-btn is-success" type="submit">＋ 追加</button>
    </form>
  );
}


// --- メインのAppコンポーネント ---
export default function App() {
  // アプリケーション全体をGoogleOAuthProviderでラップします。
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <TodoQuest />
    </GoogleOAuthProvider>
  );
}

// --- ToDoアプリの本体 ---
function TodoQuest() {
  // stageの代わりに、ユーザー情報(user)でログイン状態を管理します。
  const [user, setUser] = useState<CredentialResponse | null>(null);
  const [tasks, setTasks] = useState<Task[]>([{
    id: uuid(),
    title: '部屋の片付け',
    point: 50,
    done: false,
  }, {
    id: uuid(),
    title: '英会話',
    point: 20,
    done: false,
  }]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPoint, setEditPoint] = useState(10);
  const [editDue, setEditDue] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  // 経験値Getアニメーション用のstate
  const [xpGain, setXpGain] = useState<{ point: number; show: boolean }>({ point: 0, show: false });
  // レベルアップアニメーション用のstate
  const [levelUp, setLevelUp] = useState<{ show: boolean }>({ show: false });

  const xp = tasks.filter(t => t.done).reduce((sum, t) => sum + t.point, 0);
  const level = Math.floor(xp / 100) + 1;
  const now = new Date();
const overdueCount = tasks.filter(t => !t.done && t.due && new Date(t.due) < now).length;
  const hp = Math.max(0, MAX_HP - overdueCount);
  const toggleTask = (id: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(t => {
        if (t.id === id) {
          const wasDone = t.done;
          const newDone = !wasDone;
          
          // タスクが完了状態になった場合、経験値Getアニメーションを表示
          if (!wasDone && newDone) {
            const currentXp = tasks.filter(task => task.done).reduce((sum, task) => sum + task.point, 0);
            const newXp = currentXp + t.point;
            const currentLevel = Math.floor(currentXp / 100) + 1;
            const newLevel = Math.floor(newXp / 100) + 1;
            
            // レベルアップした場合
            if (newLevel > currentLevel) {
              setLevelUp({ show: true });
              setTimeout(() => setLevelUp({ show: false }), 3000);
            }
            
            setXpGain({ point: t.point, show: true });
            // 3秒後にアニメーションを非表示
            setTimeout(() => setXpGain(prev => ({ ...prev, show: false })), 3000);
          }
          
          return { ...t, done: newDone };
        }
        return t;
      });
      return updatedTasks;
    });
  };

  const addTask = (title: string, point: number,due?: string) => {
    setTasks(prev => [...prev, { id: uuid(), title, point, done: false, due }]);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const editTask = (id: string, newTitle: string, newPoint: number, newDue?: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, title: newTitle, point: newPoint, due: newDue } : t
    ));
  };

  // ユーザー情報がない（ログインしていない）場合は、ログインページを表示
  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-4xl mb-8">To Do クエスト</h1>
        <p className="mb-4">Googleアカウントでログインして始める</p>
        <GoogleLogin
          onSuccess={credentialResponse => {
            console.log('Login Success:', credentialResponse);
            setUser(credentialResponse); // ログイン成功時にユーザー情報をstateに保存
          }}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      </div>
    );
  }

  // ログイン済みの場合は、ToDoアプリ本体を表示
  return (
    <div className="flex flex-col md:flex-row w-full h-full p-4 gap-4">
      {/* ─ Center Cat ─ */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center border-4 border-black relative">
        <div className="absolute -top-6 bg-white border-4 border-black px-4 py-2">Lv.{level}</div>
        
        {/* 経験値・HP・レベル情報を猫の下に表示 */}
        <div className="mt-4 text-center space-y-2">
          <div className="w-64">
            <p className="mb-1">EXP: {xp} XP</p>
            <div className="w-full bg-gray-300 border-2 border-black">
              <div 
                className="bg-blue-500 h-4 transition-all duration-300"
                style={{ width: `${Math.min(100, ((xp % 100) / 100) * 100)}%` }}
              ></div>
            </div>
            <p className="text-sm mt-1">次のレベルまで: {100 - (xp % 100)} XP</p>
          </div>
          <p className="flex justify-center space-x-1">HP: {Array.from({ length: hp }).map((_, i) => 
            <img
            key={i}
            src="/docs/heart_Piskel.gif"
            className="inline w-6 h-6 align-middle ml-1"
            alt="heart"
            />
            )}
          </p>
        </div>
        
        {/* 経験値Getアニメーションを猫の上に表示 */}
        {xpGain.show && (
          <div className="absolute left-1/2 transform -translate-x-1/2 z-10 text-2xl font-bold whitespace-nowrap text-yellow-400" style={{ top: '15%' }}>
            EXP Get! +{xpGain.point} XP
          </div>
        )}
        
        {/* レベルアップアニメーションを猫の上に表示 */}
        {levelUp.show && (
          <div className="absolute left-1/2 transform -translate-x-1/2 z-10 text-3xl font-bold whitespace-nowrap text-green-400 animate-bounce" style={{ top: '5%' }}>
            LEVEL UP! 🎉
          </div>
        )}
        
        <img src="/docs/cat-animation.gif" className="w-64 h-64" alt="cat" />
      </div>

      {/* ─ Right Task Panel ─ */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full border-4 border-black p-4 flex flex-col">
        <h2 className="text-xl mb-4">今日のタスク</h2>
        <ul className="flex-1 overflow-y-auto space-y-2">
          {(() => {
            // タスクを期限ごとにグループ化
            const groupedTasks = tasks.reduce((groups, task) => {
              const dueDate = task.due ? new Date(task.due).toLocaleDateString() : '期限なし';
              if (!groups[dueDate]) {
                groups[dueDate] = [];
              }
              groups[dueDate].push(task);
              return groups;
            }, {} as Record<string, typeof tasks>);

            // 期限順にソート（期限なしは最後）
            const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
              if (a === '期限なし') return 1;
              if (b === '期限なし') return -1;
              return new Date(a).getTime() - new Date(b).getTime();
            });

            return sortedDates.map(dueDate => (
              <div key={dueDate} className="mb-4">
                <h3 className="text-lg font-bold mb-2 border-b-2 border-black pb-1">
                  {dueDate}
                </h3>
                <div className="space-y-2">
                  {groupedTasks[dueDate].map(t => (
                    <li key={t.id} className="bg-gray-100 p-2 rounded">
                      {editingTask === t.id ? (
                        <div className="flex flex-col space-y-2 w-full">
                          <input
                            className="nes-input"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            placeholder="タスク名"
                          />
                          <input
                            type="number"
                            className="nes-input"
                            min={5}
                            max={100}
                            step={5}
                            value={editPoint}
                            onChange={e => setEditPoint(Number(e.target.value))}
                            placeholder="ポイント"
                          />
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
                                editTask(t.id, editTitle, editPoint, editDue);
                                setEditingTask(null);
                              }}
                            >
                              保存
                            </button>
                            <button
                              className="nes-btn"
                              onClick={() => setEditingTask(null)}
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className={t.done ? 'line-through opacity-50' : ''}>{t.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="nes-badge"><span className="is-dark">{t.point}pt</span></span>
                              {!t.done && (
                                <button
                                  className="nes-btn is-success w-24 h-12"
                                  onClick={() => toggleTask(t.id)}
                                >
                                  完了
                                </button>
                              )}
                              {t.done && (
                                <button
                                  className="nes-btn is-warning w-24 h-12"
                                  onClick={() => toggleTask(t.id)}
                                >
                                  取り消し
                                </button>
                              )}
                              <div className="relative">
                                <button
                                  className="nes-btn"
                                  onClick={() => setShowMenu(showMenu === t.id ? null : t.id)}
                                >
                                  ⋯
                                </button>
                                {showMenu === t.id && (
                                  <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black p-2 z-10">
                                    <div className="flex space-x-2">
                                      <button
                                        className="nes-btn whitespace-nowrap"
                                        onClick={() => {
                                          setEditingTask(t.id);
                                          setEditTitle(t.title);
                                          setEditPoint(t.point);
                                          setEditDue(t.due || '');
                                          setShowMenu(null);
                                        }}
                                      >
                                        編集
                                      </button>
                                      <button
                                        className="nes-btn is-error whitespace-nowrap"
                                        onClick={() => {
                                          deleteTask(t.id);
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
                        </div>
                      )}
                    </li>
                  ))}
                </div>
              </div>
            ));
          })()}
        </ul>
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
