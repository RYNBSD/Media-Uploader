import { config } from 'dotenv'
config()

export const ENV = {
  NODE: {
    ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
  },
  MONGODB: {
    URI: process.env.MONGODB_URI
  }
} as const
