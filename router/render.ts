import { Router } from 'express'
import { home, media } from '../controller/render'
import { middlewares } from '../middleware';

export const render = Router()

render.get('/', home)
render.get('/media', middlewares.type, middlewares.validate, media);