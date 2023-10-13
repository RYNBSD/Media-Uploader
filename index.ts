import type { Request, Response, NextFunction } from 'express'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import responseTime from 'response-time'
import morgan from 'morgan'
import path from 'path'
import { cwd } from 'process'
import { ENV } from './constant'
import { render, handler } from './router'
import { connectToDb } from './model'

const app = express()

app.use(cors())
app.use(
  compression({
    level: 9,
    filter: (req, res) =>
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      req.headers?.['x-no-compression'] ? false : compression.filter(req, res)
  })
)

app.set('view engine', 'ejs')
app.set('views', path.join(cwd(), 'views'))
app.use(express.static(path.join(cwd(), 'public')))
// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore
global.IS_PRODUCTION = ENV.NODE.ENV === 'production'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())
app.use(morgan('combined'))
app.use(responseTime())

process.on('unhandledRejection', (error: Error) => {
  throw error
})

process.on('uncaughtException', (error: Error) => {
  console.error(error)
  process.exit(1)
})

app.use('/', render)
app.use('/api', handler)
app.use('*', (_, res) => res.status(404).json({ success: false }))

app.use((error: Error, _req: Request, _res: Response, next: NextFunction) => {
  next(error.message)
})

app.listen(ENV.NODE.PORT, async () => {
  await connectToDb();
  console.log('connected', ENV.NODE.PORT)
})
