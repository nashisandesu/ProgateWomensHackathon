import { CompletedTasks } from './CompletedTasks';
import { TaskSearch } from './TaskSearch';
import { useCharacter } from '../hooks';
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
  const { selectedCharacter, hasSelectedCharacter, getCurrentGif, resetCharacterSelection } = useCharacter(level);
  
  // キャラクターが選択されていない場合はデフォルトの猫を表示
  const characterGif = getCurrentGif() || "cat-animation.gif";

  return (
    <div
      className="w-full lg:w-1/2 flex flex-col items-center justify-center border-4 border-black relative h-auto lg:h-full p-2 lg:p-4"
      style={{
        backgroundImage: 'url("raw.png")',
        backgroundSize: '100% 100%', // 縦横ともに圧縮
        backgroundPosition: 'bottom',
      }}
    >
      <div className="absolute top-2 left-2 lg:top-4 lg:left-4 z-20 space-y-1 lg:space-y-2">
        <div className="text-base lg:text-lg font-bold">Lv.{level}</div>
        {selectedCharacter && (
          <div className="text-xs lg:text-sm text-blue-600 font-bold">
            キャラクター {selectedCharacter}
          </div>
        )}
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
        
        {/* デバッグ情報 */}
        {/* <div className="text-xs text-gray-500">
          <div>選択済み: {hasSelectedCharacter ? 'Yes' : 'No'}</div>
          <div>レベル % 5: {level % 5}</div>
          <div>抽選条件: {level % 5 === 1 ? 'Yes' : 'No'}</div>
        </div> */}
        
        {/* リセットボタン（開発用） */}
        {/* <button 
          onClick={resetCharacterSelection}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          リセット
        </button> */}
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
      
      {/* キャラクター抽選アニメーション */}
      {level % 5 === 1 && !hasSelectedCharacter && (
        <div className="absolute left-1/2 transform -translate-x-1/2 z-10 text-lg lg:text-xl font-bold whitespace-nowrap text-purple-400 animate-pulse" style={{ top: '25%' }}>
          キャラクター抽選中... 🎲
        </div>
      )}
      
      <img src={characterGif} className="w-40 h-40 lg:w-64 lg:h-64" alt="character" />
      
      {/* 完了タスクボタン - 左下に配置 */}
      <CompletedTasks tasks={tasks} onToggleTask={onToggleTask} />
      
      {/* 検索ボタン - 右下に配置 */}
      <TaskSearch 
        tasks={tasks} 
        onToggleTask={onToggleTask} 
        onDeleteTask={onDeleteTask} 
        onEditTask={onEditTask} 
      />
    </div>
  );
}