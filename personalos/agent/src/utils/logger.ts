import dayjs from 'dayjs';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const colors = {
  info: '\x1b[36m',   // cyan
  warn: '\x1b[33m',   // yellow
  error: '\x1b[31m',  // red
  debug: '\x1b[90m',  // gray
  reset: '\x1b[0m',
};

const icons = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  debug: '🔍',
};

function log(level: LogLevel, message: string, data?: unknown): void {
  const timestamp = dayjs().format('HH:mm:ss');
  const color = colors[level];
  const icon = icons[level];

  console.log(
    `${color}[${timestamp}] ${icon} ${message}${colors.reset}`,
    data !== undefined ? data : ''
  );
}

export const logger = {
  info: (message: string, data?: unknown) => log('info', message, data),
  warn: (message: string, data?: unknown) => log('warn', message, data),
  error: (message: string, data?: unknown) => log('error', message, data),
  debug: (message: string, data?: unknown) => log('debug', message, data),
};
