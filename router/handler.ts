import { Router } from 'express'
import { upload as uploadController } from '../controller/handler'
import { upload } from '../config'
import { middlewares } from '../middleware'

export const handler = Router()

// eslint-disable-next-line @typescript-eslint/no-misused-promises
handler.post('/upload', upload.single('media'), ...middlewares.upload, middlewares.validate, uploadController)
