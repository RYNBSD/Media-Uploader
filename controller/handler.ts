import type { Request, Response } from 'express'
import { Media } from '../model';
import { FileConverter } from '../lib';
import { FileUploader } from '../lib/file/uploader';

export const upload = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    if (!req.file) throw new Error('File not found');

    const convert = await new FileConverter(req.file.buffer).convert()
    const upload = new FileUploader(...convert).upload()

    if (!upload.length) throw new Error('Invalid file')
    
    const media = new Media({
      title,
      description,
      ...upload[0],
    })
    await media.save()

    res.status(201).redirect('/media?type=image');
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      success: false
    })
  }
}
