export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface TaskTimestamps {
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface Task {
  id: string;
  name: string;
  category: string;
  status: TaskStatus;
  timestamps: TaskTimestamps;
  notes?: string;
}
