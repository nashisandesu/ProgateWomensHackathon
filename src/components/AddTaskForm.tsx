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
  const [minDateTime, setMinDateTime] = useState('');
  const [dueError, setDueError] = useState('');
  const [titleError, setTitleError] = useState('');

  // 現在時刻を最小値として設定
  useEffect(() => {
    const now = new Date();
    // 現在時刻をISO文字列に変換し、datetime-local形式に調整
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setMinDateTime(localDateTime);
  }, []);

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

  // タスク名の変更処理
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (value.trim()) {
      setTitleError('');
    }
  };

  // 期限が過去の日時でないかチェック
  const handleDueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedValue = e.target.value;
    
    if (!selectedValue) {
      setDue(selectedValue);
      setDueError('');
      return;
    }
    
    const selectedDate = new Date(selectedValue);
    const now = new Date();
    
    if (selectedDate < now) {
      setDue(selectedValue);
      setDueError('過去の日時は選択できません');
    } else {
      setDue(selectedValue);
      setDueError('');
    }
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        
        // タスク名の検証
        if (!title.trim()) {
          setTitleError('タスク名を入力してください');
          return;
        }
        
        if (dueError) return;
        onAdd(title.trim(), point, due);
        setTitle('');
        setPoint(10);
        setDue('');
        setDueError('');
        setTitleError('');
      }}
      className="p-4 bg-white rounded-lg shadow-sm border border-gray-200"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タスク名
          </label>
          <input
            className={`w-full nes-input ${titleError ? 'border-red-500' : ''}`}
            placeholder="タスク名を入力してください"
            value={title}
            onChange={handleTitleChange}
          />
          {titleError && (
            <p className="text-xs text-red-500 mt-1">
              {titleError}
            </p>
          )}
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
            className={`w-full nes-input ${dueError ? 'border-red-500' : ''}`}
            value={due}
            onChange={handleDueChange}
            min={minDateTime}
            placeholder="期限を選択してください"
          />
          {dueError && (
            <p className="text-xs text-red-500 mt-1">
              {dueError}
            </p>
          )}
        </div>
        
        <button 
          className="w-full nes-btn is-success" 
          type="submit" 
          disabled={isCalculating || !!dueError}
        >
          ＋ タスクを追加
        </button>
      </div>
    </form>
  );
} 