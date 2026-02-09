import pino from 'pino'

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

export const logger = pino({
  level: isTest ? 'silent' : (process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')),
  ...(isProduction
    ? {
        // Production: JSON output for log aggregation
        formatters: {
          level: (label: string) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {
        // Development: pretty-printed output
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }),
})

// Named child loggers for different modules
export const authLogger = logger.child({ module: 'auth' })
export const paymentLogger = logger.child({ module: 'payment' })
export const fluxLogger = logger.child({ module: 'flux-kontext' })
export const rateLimitLogger = logger.child({ module: 'rate-limit' })
export const apiLogger = logger.child({ module: 'api' })
