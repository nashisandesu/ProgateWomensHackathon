export interface Task {
    id: string;
    title: string;
    point: number;
    done: boolean;
    due?: string;
  }