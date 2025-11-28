export enum LoomStatus {
  RUNNING = 'EM PRODUÇÃO',
  STOPPED = 'PARADO',
  MAINTENANCE = 'MANUTENÇÃO',
  SETUP = 'TROCA DE ARTIGO/SETUP',
  WAITING_MATERIAL = 'AGUARDANDO FIO',
  OFFLINE = 'DESLIGADO'
}

export interface Article {
  id: string;
  code: string;
  name: string;
  defaultTimeMinutes: number; // Tempo padrão estimado para produzir uma unidade/rolo
}

export interface Loom {
  id: number; // 1 to 20
  name: string;
  status: LoomStatus;
  clientId: string;
  clientName: string;
  articleId: string | null; // Referência ao artigo (opcional)
  articleName?: string; // Nome do artigo (texto livre)
  internalOrderNumber: string; // Nº Interno
  startTime: string | null; // ISO Date string
  expectedEndTime: string | null; // ISO Date string
  progress: number; // 0 to 100 calculated
  plannedDurationMinutes?: number; // Duração planeada em minutos
  notes?: string;
}

export interface ProductionData {
  looms: Loom[];
  articles: Article[];
}