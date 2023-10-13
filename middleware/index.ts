import type { Request, Response, NextFunction } from 'express'
import { body, query, validationResult } from "express-validator";

export const middlewares = {
  upload: [
    body("title").isString().trim().isLength({ max: 50, min: 1 }).escape().withMessage('Invalid title'),
    body("description").isString().trim().isLength({ max: 255, min: 0 }).escape().withMessage('Invalid description'),
  ],
  type: query('type').isIn(['image', 'video', 'audio']).withMessage('Invalid type'),
  validate(req: Request, _res: Response, next: NextFunction) {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) next()
      else {
        let message = '';

        Object.entries(result.mapped()).forEach(([key, value]) => {
          message += `${key}: ${value.msg}\n`;
        })

        throw new Error(message)
      }
    } catch (error) {
      next((error as Error).message);
    }
  }
};
