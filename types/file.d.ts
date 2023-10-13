export type FileTypes = "image" | "audio" | "video";
export type ConvertResult = {
  buffer: Buffer,
  type: FileTypes
}