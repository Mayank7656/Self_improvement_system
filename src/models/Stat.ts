export interface StatDelta {
  stamina: number;
  skills: number;
  intelligence: number;
  power: number;
  timeManagement: number;
}

export interface StatSnapshot {
  stamina: number;
  skills: number;
  intelligence: number;
  power: number;
  timeManagement: number;
  recordedAt: string;
}

export type AggregationPeriod = 'day' | 'week' | 'month';

export interface StatTimeSeriesBucket {
  period: AggregationPeriod;
  periodStart: string;
  periodEnd: string;
  totals: StatDelta;
}
