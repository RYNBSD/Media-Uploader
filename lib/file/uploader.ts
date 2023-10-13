import type { ConvertResult, FileTypes } from "../../types";
import { randomUUID } from "crypto";
import { writeFileSync } from "fs";
import { join } from "path";
import { cwd } from "process";

export class FileUploader {
  private readonly files: ConvertResult[] = [];
  private readonly PATHS = {
    IMAGES: join(cwd(), "public", "upload", "images"),
    VIDEOS: join(cwd(), "public", "upload", "videos"),
    AUDIOS: join(cwd(), "public", "upload", "audios"),
  } as const;

  constructor(...files: ConvertResult[]) {
    this.files = files;
  }

  private generateUniqueFileName(): string {
    return `${Date.now()}_${randomUUID()}`;
  }

  upload() {
    const filesUri: { uri: string; type: FileTypes }[] = [];
    this.files.forEach((file) => {
      switch (file.type) {
        case "image":
          {
            const imageName = `${this.generateUniqueFileName()}.webp`;
            const imageUri = join("upload", "images", imageName);
            writeFileSync(join(this.PATHS.IMAGES, imageName), file.buffer);
            filesUri.push({ uri: imageUri, type: "image" });
          }
          break;
        case "video":
          {
            const videoName = `${this.generateUniqueFileName()}.mp4`;
            const videoUri = join("upload", "videos", videoName);
            writeFileSync(join(this.PATHS.VIDEOS, videoName), file.buffer);
            filesUri.push({ uri: videoUri, type: "video" });
          }
          break;
        case "audio":
          {
            const audioName = `${this.generateUniqueFileName()}.mp3`;
            const audioUri = join("upload", "audios", audioName);
            writeFileSync(
              join(this.PATHS.AUDIOS, audioName),
              file.buffer
            );
            filesUri.push({ uri: audioUri, type: "audio" })
          }
          break;
      }
    });

    return filesUri;
  }
}
