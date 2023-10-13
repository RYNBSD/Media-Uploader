import type { Request, Response } from 'express'
import { images, audios, videos } from '../utils'

export const home = (_req: Request, res: Response): void => {
  try {
    res.status(200).render('index')
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      success: false
    })
  }
}

export const media = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.query;
    let medias: unknown[] = []

    switch(type) {
      case'image': medias = await images(); break;
      case'video': medias = await videos(); break;
      case'audio': medias = await audios(); break;
    }

    res.status(200).render('media', {
      type,
      medias,
    })
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      success: false
    })
  }
}
