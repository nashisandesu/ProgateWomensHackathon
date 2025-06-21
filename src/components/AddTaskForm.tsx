import { useState, useEffect } from 'react';
import { calculateExperiencePoints } from '../utils/gemini';

interface AddTaskFormProps {
  onAdd: (title: string, point: number, due?: string) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [point, setPoint] = useState<number>(10);
  const [due, setDue] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // タスク名が変更されたときに経験値を自動計算
  useEffect(() => {
    if (title.trim()) {
      setIsCalculating(true);
      calculateExperiencePoints(title.trim())
        .then(points => {
          setPoint(points);
          setIsCalculating(false);
        })
        .catch(() => {
          setIsCalculating(false);
        });
    }
  }, [title]);

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
      <div className="flex items-center space-x-2">
        <input
          type="number"
          className="nes-input flex-1"
          min={5}
          max={100}
          step={5}
          value={point}
          onChange={e => setPoint(Number(e.target.value))}
          disabled={isCalculating}
        />
        {isCalculating && (
          <span className="text-sm text-gray-500">計算中...</span>
        )}
      </div>
      <input
        type="date"
        className="nes-input"
        value={due}
        onChange={e => setDue(e.target.value)}
      />
      <button className="nes-btn is-success" type="submit" disabled={isCalculating}>
        ＋ 追加
      </button>
    </form>
  );
} 