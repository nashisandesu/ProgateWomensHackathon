import { useState, useEffect, useRef } from "react";

interface UseCharacterReturn {
  selectedCharacter: number | null;
  hasSelectedCharacter: boolean;
  getCurrentGif: () => string;
  resetCharacterSelection: () => void;
}

export function useCharacter(level: number): UseCharacterReturn {
  // --- state --------------------------------------------------------------
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(() => {
    const stored = localStorage.getItem("todoQuestCharacter");
    return stored ? Number(stored) : null;
  });

  const [hasSelectedCharacter, setHasSelectedCharacter] = useState<boolean>(() => {
    return localStorage.getItem("todoQuestHasSelected") === "true";
  });

  const previousLevelRef = useRef<number>(level);

  // --- helpers ------------------------------------------------------------
  const pickRandomCharacter = () => {
    const random = Math.floor(Math.random() * 15) + 1; // 1–15
    setSelectedCharacter(random);
    setHasSelectedCharacter(true);
  };

  // --- persist character --------------------------------------------------
  useEffect(() => {
    if (selectedCharacter !== null) {
      try {
        localStorage.setItem("todoQuestCharacter", selectedCharacter.toString());
        localStorage.setItem("todoQuestHasSelected", "true");
        console.log("Saved character to localStorage:", selectedCharacter);
      } catch (err) {
        console.error("Failed to save character to localStorage:", err);
      }
    }
  }, [selectedCharacter]);

  // --- selection logic ----------------------------------------------------
  useEffect(() => {
    const prev = previousLevelRef.current;
    const isLevelUp = level > prev;
    const isPickTiming = level !== 0 && level % 5 === 1; // 1,6,11,…

    console.log("Character selection check:", {
      level,
      prev,
      isLevelUp,
      isPickTiming,
      hasSelectedCharacter,
    });

    if (!hasSelectedCharacter) {
      // 初回
      pickRandomCharacter();
    } else if (isLevelUp && isPickTiming) {
      // レベル到達トリガ
      pickRandomCharacter();
    }

    previousLevelRef.current = level;
  }, [level]); // ← hasSelectedCharacter を依存から外す

  // --- public helpers -----------------------------------------------------
  const resetCharacterSelection = () => {
    console.log("Resetting character selection");
    setSelectedCharacter(null);
    setHasSelectedCharacter(false);
    localStorage.removeItem("todoQuestCharacter");
    localStorage.removeItem("todoQuestHasSelected");
  };

  const getCurrentGif = () => {
    if (selectedCharacter === null) return "cat-animation.gif";

    const normalizedLevel = ((level - 1) % 5) + 1; // 1–5
    return `/character${selectedCharacter}/level${normalizedLevel}.gif`;
  };

  // --- return -------------------------------------------------------------
  return {
    selectedCharacter,
    hasSelectedCharacter,
    getCurrentGif,
    resetCharacterSelection,
  };
}
