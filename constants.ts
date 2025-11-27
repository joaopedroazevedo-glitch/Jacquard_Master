import { Loom, LoomStatus, Article } from './types';

export const INITIAL_ARTICLES: Article[] = [
  { id: 'a1', code: 'JACQ-001', name: 'Damasco Floral Real', defaultTimeMinutes: 120 },
  { id: 'a2', code: 'JACQ-002', name: 'Brocalado Gold', defaultTimeMinutes: 180 },
  { id: 'a3', code: 'JACQ-003', name: 'Cetim Estampado', defaultTimeMinutes: 90 },
  { id: 'a4', code: 'TAP-104', name: 'Tapeçaria Vintage', defaultTimeMinutes: 300 },
];

const generateLooms = (): Loom[] => {
  const looms: Loom[] = [];
  for (let i = 1; i <= 20; i++) {
    // Generate some random initial state
    const isRunning = Math.random() > 0.3;
    const status = isRunning ? LoomStatus.RUNNING : (Math.random() > 0.5 ? LoomStatus.STOPPED : LoomStatus.SETUP);
    
    // Mock times for running looms
    let start = null;
    let end = null;
    let progress = 0;
    let plannedDuration = 120; // Default

    if (status === LoomStatus.RUNNING) {
        const now = new Date();
        const duration = 120 + Math.floor(Math.random() * 100);
        plannedDuration = duration;
        const elapsed = Math.floor(Math.random() * duration);
        
        start = new Date(now.getTime() - elapsed * 60000).toISOString();
        end = new Date(now.getTime() + (duration - elapsed) * 60000).toISOString();
        progress = Math.floor((elapsed / duration) * 100);
    }

    looms.push({
      id: i,
      name: `Tear Jacquard #${i.toString().padStart(2, '0')}`,
      status: status,
      clientId: status === LoomStatus.RUNNING ? `Cliente ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}` : '',
      clientName: status === LoomStatus.RUNNING ? `Têxteis ${String.fromCharCode(65 + Math.floor(Math.random() * 5))} Ltda` : '',
      articleId: status === LoomStatus.RUNNING ? INITIAL_ARTICLES[Math.floor(Math.random() * INITIAL_ARTICLES.length)].id : null,
      internalOrderNumber: status === LoomStatus.RUNNING ? `OF-${202400 + i}` : '',
      startTime: start,
      expectedEndTime: end,
      progress: progress,
      plannedDurationMinutes: plannedDuration
    });
  }
  return looms;
};

export const INITIAL_LOOMS: Loom[] = generateLooms();

export const STATUS_COLORS = {
  [LoomStatus.RUNNING]: 'bg-green-500',
  [LoomStatus.STOPPED]: 'bg-red-500',
  [LoomStatus.MAINTENANCE]: 'bg-orange-500',
  [LoomStatus.SETUP]: 'bg-blue-500',
  [LoomStatus.WAITING_MATERIAL]: 'bg-yellow-400',
  [LoomStatus.OFFLINE]: 'bg-gray-400',
};

export const STATUS_TEXT_COLORS = {
  [LoomStatus.RUNNING]: 'text-green-700 bg-green-100',
  [LoomStatus.STOPPED]: 'text-red-700 bg-red-100',
  [LoomStatus.MAINTENANCE]: 'text-orange-700 bg-orange-100',
  [LoomStatus.SETUP]: 'text-blue-700 bg-blue-100',
  [LoomStatus.WAITING_MATERIAL]: 'text-yellow-800 bg-yellow-100',
  [LoomStatus.OFFLINE]: 'text-gray-600 bg-gray-200',
};