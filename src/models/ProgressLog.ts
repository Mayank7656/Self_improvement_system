import { StatDelta, StatTimeSeriesBucket } from './Stat';

export interface ProgressLogEntry {
  id: string;
  taskId: string;
  taskName: string;
  category: string;
  status: 'completed' | 'partial' | 'failed' | 'skipped';
  timestamp: string;
  statDelta: StatDelta;
  notes?: string;
}

export interface ProgressLogSeries {
  entries: ProgressLogEntry[];
  buckets: StatTimeSeriesBucket[];
}
