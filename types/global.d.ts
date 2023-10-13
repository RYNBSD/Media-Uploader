declare global {
  var IS_PRODUCTION: boolean

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production'
      PORT: number | `${number}`,
      MONGODB_URI: string
    }
  }
}

export {}
