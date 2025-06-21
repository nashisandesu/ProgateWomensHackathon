import { useState } from 'react';
import type { Task } from './types';
import { v4 as uuid } from 'uuid';

const HEART = '💙';
const MAX_HP = 5;

export default function App() {
  const [stage, setStage] = useState<'start' | 'play'>('start');
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

  const xp = tasks.filter(t => t.done).reduce((sum, t) => sum + t.point, 0);
  const level = Math.floor(xp / 100) + 1;
  const hp = Math.max(0, MAX_HP - tasks.filter(t => !t.done).length);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTask = (title: string, point: number) => {
    setTasks(prev => [...prev, { id: uuid(), title, point, done: false }]);
  };

  if (stage === 'start') {
    return (
      <div className="text-center">
        <h1 className="text-4xl mb-8">To Do クエスト</h1>
        <button className="nes-btn is-primary" onClick={() => setStage('play')}>
          ▶ ログインして始める (仮)
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-full p-4 gap-4">
      {/* ─ Left HUD ─ */}
      <div className="w-full md:w-1/4 h-1/3 md:h-full border-4 border-black p-4 space-y-4">
        <div>
          <p>経験値: {xp} XP</p>
          <p className="flex space-x-1 mt-2">HP: {Array.from({ length: hp }).map((_, i) => <span key={i}>{HEART}</span>)}</p>
          <p className="mt-2">レベル: Lv.{level}</p>
        </div>
      </div>

      {/* ─ Center Cat ─ */}
      <div className="flex-1 flex flex-col items-center justify-center border-4 border-black relative">
        <div className="absolute -top-6 bg-white border-4 border-black px-4 py-2">Lv.{level}</div>
        {/* ネコ画像 (OSS スプライト) */}
        <img src="https://raw.githubusercontent.com/ikatyang/emoji-cheat-sheet/master/public/graphics/emojis/cat.png" className="w-32 h-32" alt="cat" />
      </div>

      {/* ─ Right Task Panel ─ */}
      <div className="w-full md:w-1/3 h-1/2 md:h-full border-4 border-black p-4 flex flex-col">
        <h2 className="text-xl mb-4">今日のタスク</h2>
        <ul className="flex-1 overflow-y-auto space-y-2">
          {tasks.map(t => (
            <li key={t.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="nes-checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
                <span className={t.done ? 'line-through opacity-50' : ''}>{t.title}</span>
              </label>
              <span className="nes-badge"><span className="is-dark">{t.point}pt</span></span>
            </li>
          ))}
        </ul>
        {/* Add Task */}
        <AddTaskForm onAdd={addTask} />
      </div>
    </div>
  );
}

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
