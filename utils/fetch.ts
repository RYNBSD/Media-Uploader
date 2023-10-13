/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Media } from "../model"

export const images = async () => {
  // @ts-ignore
  return await Media.find({ type: 'image' }).exec()
}

export const videos = async () => {
  // @ts-ignore
  return await Media.find({ type: 'video' }).exec()
}

export const audios = async () => {
  // @ts-ignore
  return await Media.find({ type: 'audio' }).exec()
}