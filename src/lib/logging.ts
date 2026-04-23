import "server-only";

import pino from "pino";

// Google Cloud Logging LogSeverity mapping
// https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
const LEVEL_TO_SEVERITY: Record<number, string> = {
  10: "DEBUG",
  20: "DEBUG",
  30: "INFO",
  40: "WARNING",
  50: "ERROR",
  60: "CRITICAL",
};

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  formatters: {
    level(label, number) {
      return {
        severity: LEVEL_TO_SEVERITY[number] ?? "DEFAULT",
        level: label,
      };
    },
  },
  messageKey: "message",
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  // TODO: inject trace / spanId once request-scoped context is introduced.
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, singleLine: false },
    },
  }),
});

type LogPayload = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return error;
}

export function logInfo(event: string, payload?: LogPayload): void {
  logger.info({ event, ...payload });
}

export function logWarn(event: string, payload?: LogPayload): void {
  logger.warn({ event, ...payload });
}

export function logError(event: string, payload?: LogPayload, error?: unknown): void {
  logger.error({ event, ...payload, error: serializeError(error) });
}
