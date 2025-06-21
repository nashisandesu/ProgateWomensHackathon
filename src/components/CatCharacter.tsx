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
    <div className="w-full lg:w-1/2 flex flex-col items-center justify-center border-4 border-black relative h-auto lg:h-full p-2 lg:p-4">
      <div className="absolute top-2 left-2 lg:top-4 lg:left-4 z-20 space-y-1 lg:space-y-2">
        <div className="text-base lg:text-lg font-bold">Lv.{level}</div>
        <div className="w-24 lg:w-32">
          <div className="w-full bg-gray-300 border-2 border-black">
            <div 
              className="bg-blue-500 h-2 lg:h-3 transition-all duration-300"
              style={{ width: `${Math.min(100, ((xp % 100) / 100) * 100)}%` }}
            ></div>
          </div>
          <div className="text-xs mt-1">EXP: {xp}</div>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs lg:text-sm">HP:</span>
          {Array.from({ length: hp }).map((_, i) => 
            <img
              key={i}
              src="heart_Piskel.gif"
              className="inline w-3 h-3 lg:w-4 lg:h-4 align-middle"
              alt="heart"
            />
          )}
        </div>
      </div>
      
      {/* 経験値Getアニメーションを猫の上に表示 */}
      {xpGain.show && (
        <div className="absolute left-1/2 transform -translate-x-1/2 z-10 text-lg lg:text-2xl font-bold whitespace-nowrap text-yellow-400" style={{ top: '15%' }}>
          EXP Get! +{xpGain.point} XP
        </div>
      )}
      
      {/* レベルアップアニメーションを猫の上に表示 */}
      {levelUp.show && (
        <div className="absolute left-1/2 transform -translate-x-1/2 z-10 text-xl lg:text-3xl font-bold whitespace-nowrap text-green-400 animate-bounce" style={{ top: '5%' }}>
          LEVEL UP! 🎉
        </div>
      )}
      
      <img src="cat-animation.gif" className="w-48 h-48 lg:w-64 lg:h-64" alt="cat" />
      
      {/* 完了タスクボタン - 左下に配置 */}
      <div className="absolute bottom-1 left-1 lg:bottom-4 lg:left-4">
        <CompletedTasks tasks={tasks} onToggleTask={onToggleTask} />
      </div>
      
      {/* 検索ボタン - 右下に配置 */}
      <div className="absolute bottom-1 right-1 lg:bottom-4 lg:right-4">
        <TaskSearch 
          tasks={tasks} 
          onToggleTask={onToggleTask} 
          onDeleteTask={onDeleteTask} 
          onEditTask={onEditTask} 
        />
      </div>
    </div>
  );
} 