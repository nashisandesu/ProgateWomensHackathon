import { useState, useEffect } from 'react';
import type { Task } from './types';
import { v4 as uuid } from 'uuid';
import { GoogleOAuthProvider, GoogleLogin, type CredentialResponse } from '@react-oauth/google';

const HEART = '💙';
const MAX_HP = 5;
const GOOGLE_CLIENT_ID = "527828076351-j8ajmuudb77dkmt7jrd4j4l791fpbvsh.apps.googleusercontent.com";

const USER_STORAGE_KEY = 'todo-quest-user';
const TASKS_STORAGE_KEY = 'todo-quest-tasks';

function AddTaskForm({ onAdd }: { onAdd: (title: string, point: number) => void }) {
  const [title, setTitle] = useState('');
  const [point, setPoint] = useState<number>(10);
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!title.trim()) return;
        onAdd(title.trim(), point);
        setTitle('');
        setPoint(10);
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
      <button className="nes-btn is-success" type="submit">＋ 追加</button>
    </form>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <TodoQuest />
    </GoogleOAuthProvider>
  );
}

// ToDoアプリの本体
function TodoQuest() {
  const [user, setUser] = useState<CredentialResponse | null>(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks);
      } catch (e) {
        console.error("Failed to parse tasks from localStorage", e);
      }
    }
    return [
      { id: uuid(), title: '部屋の片付け', point: 50, done: false },
      { id: uuid(), title: '英会話', point: 20, done: false }
    ];
  });

  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPoint, setEditPoint] = useState(10);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    // ログイン情報を保存
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      // ログアウト時はログイン情報のみ削除
      localStorage.removeItem(USER_STORAGE_KEY);
    }
    // タスク情報は常に保存
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [user, tasks]);

  const xp = tasks.filter(t => t.done).reduce((sum, t) => sum + t.point, 0);
  const level = Math.floor(xp / 100) + 1;
  const hp = Math.max(0, MAX_HP - tasks.filter(t => !t.done).length);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTask = (title: string, point: number) => {
    setTasks(prev => [...prev, { id: uuid(), title, point, done: false }]);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const editTask = (id: string, newTitle: string, newPoint: number) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, title: newTitle, point: newPoint } : t
    ));
  };

  const handleLogout = () => {
    // ログイン状態だけを解除する。タスクデータ(localStorage)は消さない。
    setUser(null);
  };

  if (!user) {
    return (
      <div className="text-center">
        <h1 className="text-4xl mb-8">To Do クエスト</h1>
        <p className="mb-4">Googleアカウントでログインして始める</p>
        <GoogleLogin
          onSuccess={credentialResponse => {
            setUser(credentialResponse);
          }}
          onError={() => {
            console.log('Login Failed');
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-full p-4 gap-4">
      <div className="w-full md:w-1/4 h-1/3 md:h-full border-4 border-black p-4 space-y-4 flex flex-col justify-between">
        <div>
          <p>経験値: {xp} XP</p>
          <p className="flex space-x-1 mt-2">HP: {Array.from({ length: hp }).map((_, i) => <span key={i}>{HEART}</span>)}</p>
          <p className="mt-2">レベル: Lv.{level}</p>
        </div>
        <div>
          <button className="nes-btn is-error w-full" onClick={handleLogout}>
            ログアウト
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center border-4 border-black relative">
        <div className="absolute -top-6 bg-white border-4 border-black px-4 py-2">Lv.{level}</div>
        <img src="/docs/cat-animation.gif" className="w-32 h-32" alt="cat" />
      </div>
      <div className="w-full md:w-1/3 h-1/2 md:h-full border-4 border-black p-4 flex flex-col">
        <h2 className="text-xl mb-4">今日のクエスト
        </h2>
        <ul className="flex-1 overflow-y-auto space-y-2">
          {tasks.map(t => (
            <li key={t.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <div className="flex items-center space-x-2">
                {editingTask === t.id ? (
                  <div className="flex flex-col space-y-2 w-full">
                    <input className="nes-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                    <input type="number" className="nes-input" min={5} max={100} step={5} value={editPoint} onChange={e => setEditPoint(Number(e.target.value))} />
                    <div className="flex space-x-2">
                      <button className="nes-btn is-success" onClick={() => { editTask(t.id, editTitle, editPoint); setEditingTask(null); }}>保存</button>
                      <button className="nes-btn" onClick={() => setEditingTask(null)}>キャンセル</button>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="nes-checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
                    <span className={t.done ? 'line-through opacity-50' : ''}>{t.title}</span>
                  </label>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {editingTask !== t.id && ( <span className="nes-badge"><span className="is-dark">{t.point}pt</span></span> )}
                {editingTask !== t.id && (
                  <div className="relative">
                    <button className="nes-btn" onClick={() => setShowMenu(showMenu === t.id ? null : t.id)}>⋯</button>
                    {showMenu === t.id && (
                      <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black p-2 z-10">
                        <button className="nes-btn block w-full text-left mb-1" onClick={() => { setEditingTask(t.id); setEditTitle(t.title); setEditPoint(t.point); setShowMenu(null); }}>編集</button>
                        <button className="nes-btn is-error block w-full text-left" onClick={() => { deleteTask(t.id); setShowMenu(null); }}>削除</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        <AddTaskForm onAdd={addTask} />
      </div>
    </div>
  );
}