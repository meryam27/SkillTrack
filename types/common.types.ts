// /src/types/common.types.ts
export interface DateRange {
  start: Date;
  end: Date;
}

export interface SearchCriteria {
  filiereId?: string;
  niveau?: string;
  promotion?: number;
  competences?: string[];
  progressMin?: number;
  progressMax?: number;
}

export interface SystemHealth {
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  checks: {
    database: boolean;
    cache: boolean;
    externalServices: boolean;
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    uptime: number;
  };
}
