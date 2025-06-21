import { CompletedTasks } from './CompletedTasks';
import { TaskSearch } from './TaskSearch';
import type { Task } from '../types';

interface CatCharacterProps {
  level: number;
  xp: number;
  hp: number;
  xpGain: { point: number; show: boolean };
  levelUp: { show: boolean };
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newTitle: string, newPoint: number, newDue?: string) => void;
}

export function CatCharacter({ level, xp, hp, xpGain, levelUp, tasks, onToggleTask, onDeleteTask, onEditTask }: CatCharacterProps) {
  return (
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
            src="heart_Piskel.gif"
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
      
      <img src="cat-animation.gif" className="w-64 h-64" alt="cat" />
      
      {/* 完了タスクボタン */}
      <CompletedTasks tasks={tasks} onToggleTask={onToggleTask} />
      
      {/* 検索ボタン */}
      <TaskSearch 
        tasks={tasks} 
        onToggleTask={onToggleTask}
        onDeleteTask={onDeleteTask}
        onEditTask={onEditTask}
      />
    </div>
  );
} 