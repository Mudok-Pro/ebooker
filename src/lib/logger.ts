type LogLevel = "info" | "warn" | "error";

const LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || "info";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  info: 0,
  warn: 1,
  error: 2,
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[LOG_LEVEL];
}

export const logger = {
  info(msg: string, data?: Record<string, unknown>) {
    if (shouldLog("info")) {
      queueMicrotask(() =>
        console.log(
          JSON.stringify({ level: "info", msg, ...data, ts: Date.now() })
        )
      );
    }
  },
  warn(msg: string, data?: Record<string, unknown>) {
    if (shouldLog("warn")) {
      queueMicrotask(() =>
        console.warn(
          JSON.stringify({ level: "warn", msg, ...data, ts: Date.now() })
        )
      );
    }
  },
  error(msg: string, data?: Record<string, unknown>) {
    if (shouldLog("error")) {
      queueMicrotask(() =>
        console.error(
          JSON.stringify({ level: "error", msg, ...data, ts: Date.now() })
        )
      );
    }
  },
};
