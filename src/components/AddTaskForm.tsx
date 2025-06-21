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
      className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タスク名
          </label>
          <input
            className="w-full nes-input"
            placeholder="タスク名を入力してください"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            経験値
          </label>
          <div className="flex items-center space-x-3">
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
              <span className="text-sm text-gray-500 whitespace-nowrap">計算中...</span>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            期限
          </label>
          <input
            type="datetime-local"
            className="w-full nes-input"
            value={due}
            onChange={e => setDue(e.target.value)}
          />
        </div>
        
        <button 
          className="w-full nes-btn is-success" 
          type="submit" 
          disabled={isCalculating}
        >
          ＋ タスクを追加
        </button>
      </div>
    </form>
  );
} 