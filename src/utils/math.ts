// Math utility functions
export const random = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export type Difficulty = 'easy' | 'normal' | 'hard';

export const generateMathQuestion = (
  level: number = 1,
  difficulty: Difficulty = 'normal'
): { question: string; answer: number; options: number[] } => {
  const effectiveLevel = difficulty === 'easy' ? Math.max(1, level - 1) : difficulty === 'hard' ? level + 1 : level;
  const maxNum = Math.max(5, effectiveLevel * 10);
  const a = random(1, maxNum);
  const b = random(1, maxNum);
  const operations = ['+', '-', '*'];
  const opIndex = difficulty === 'easy' ? 0 : difficulty === 'hard' ? Math.min(effectiveLevel, 2) : Math.min(level - 1, 2);
  const operation = operations[Math.max(0, random(0, opIndex))];

  let answer: number;
  let question: string;

  switch (operation) {
    case '+':
      answer = a + b;
      question = `${a} + ${b}`;
      break;
    case '-':
      answer = a - b;
      question = `${a} - ${b}`;
      break;
    case '*':
      answer = a * b;
      question = `${a} × ${b}`;
      break;
    default:
      answer = a + b;
      question = `${a} + ${b}`;
  }

  const spread = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 8 : 5;
  const options = [answer];
  while (options.length < 4) {
    const wrongAnswer = answer + random(-spread, spread);
    if (wrongAnswer !== answer && !options.includes(wrongAnswer) && wrongAnswer >= 0) {
      options.push(wrongAnswer);
    }
  }

  return {
    question,
    answer,
    options: shuffle(options),
  };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const calculateStars = (score: number, maxScore: number): number => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 90) return 3;
  if (percentage >= 70) return 2;
  if (percentage >= 50) return 1;
  return 0;
};

