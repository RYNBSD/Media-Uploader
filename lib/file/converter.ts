import type { FileExtension } from "file-type/core";
import type { ConvertResult, FileTypes } from "../../types";
import { fromBuffer } from "file-type";
import sharp from "sharp";
import fluentFfmpeg from "fluent-ffmpeg";
import { writeFileSync, readFileSync, rmSync } from "fs";
import { join } from "path";

class FileTmp {
  constructor() {}

  protected randomName() {
    return Math.round(Math.random() * Date.now());
  }

  protected create(file: Buffer, ext: string): string {
    const path = join(__dirname, `${this.randomName()}.${ext}`);
    writeFileSync(path, file);
    return path;
  }

  protected delete(path: string): void {
    rmSync(path);
  }

  protected read(path: string): Buffer {
    return readFileSync(path);
  }
}

export class FileConverter extends FileTmp {
  private readonly files: Buffer[] = [];
  private readonly EXTENSIONS = {
    IMAGES: ["webp", "png", "jpg", "jpeg"],
    VIDEOS: ["mkv", "mov", "mp4"],
    AUDIOS: ["mp3", "wav"],
  } as const;

  constructor(...files: Buffer[]) {
    super();
    this.files = files;
  }

  private async checkFormat(
    file: Buffer
  ): Promise<{ isValid: boolean; type?: FileTypes, ext?: FileExtension }> {
    const ext = (await fromBuffer(file))?.ext;

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!ext) return { isValid: false };
    else if (this.EXTENSIONS.IMAGES.includes(ext))
      return { isValid: true, type: "image" };
    else if (this.EXTENSIONS.VIDEOS.includes(ext))
      return { isValid: true, type: "video", ext };
    else if (this.EXTENSIONS.AUDIOS.includes(ext))
      return { isValid: true, type: "audio", ext };
    else return { isValid: false };
  }

  // 100kb png -> 75kb webp
  private async toWebp(image: Buffer): Promise<Buffer> {
    return await sharp(image)
      .resize({ width: 1000, height: 1000, fit: "cover" })
      .webp()
      .toBuffer();
  }

  private initFfmpeg() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fluentFfmpeg.setFfmpegPath(require("@ffmpeg-installer/ffmpeg").path);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    fluentFfmpeg.setFfprobePath(require("@ffprobe-installer/ffprobe").path);
  }

  private async toMp4(video: Buffer, ext: string): Promise<Buffer | null> {
    const inputVideo = this.create(video, ext);
    const [outputWidth, outputHeight] = [1920, 1080];
    const outputVideo = join(__dirname, `${this.randomName()}.mp4`);

    return await new Promise<Buffer | null>((resolve, reject) => {
      fluentFfmpeg()
        .input(inputVideo)
        .outputOptions("-c:v", "libx264") // Video codec: H.264
        .outputOptions("-preset", "slow") // Preset for better compression
        .outputOptions("-crf", "0") // Constant Rate Factor: 0 (lossless) to 51 (worst quality)
        .outputOptions("-c:a", "aac") // Audio codec: AAC
        .outputOptions("-b:a", "128k") // Audio bitrate
        .outputOptions(
          "-vf",
          `scale=w=${outputWidth}:h=${outputHeight}:force_original_aspect_ratio=decrease,pad=${outputWidth}:${outputHeight}:(ow-iw)/2:(oh-ih)/2`
        ) // Resize and center video
        .outputOptions("-r", "30") // Set output frame rate to 30 fps
        .output(outputVideo)
        // .on('start', (commandLine) => {
        //   console.log('Start', commandLine)
        // })
        .on("end", () => {
          this.delete(inputVideo);
          resolve(this.read(outputVideo));
          this.delete(outputVideo);
        })
        .on("error", () => {
          reject(null);
        })
        .run();
    });
  }

  private async toMp3(audio: Buffer, ext: string): Promise<Buffer | null> {
    const inputAudio = this.create(audio, ext);
    const outputAudio = join(__dirname, `${Date.now()}.mp3`);

    return await new Promise<Buffer | null>((resolve, reject) => {
      fluentFfmpeg()
        .input(inputAudio)
        .audioCodec("libmp3lame") // MP3 audio codec
        .audioBitrate("128k") // Audio bitrate: 128 kbps
        .output(outputAudio)
        // .on('start', (commandLine) => {
        //   console.log('Start', commandLine)
        // })
        .on("end", () => {
          this.delete(inputAudio);
          resolve(this.read(outputAudio));
          this.delete(outputAudio);
        })
        .on("error", () => {
          reject(null);
        })
        .run();
    });
  }

  async convert() {
    const outputFiles: ConvertResult[] = [];
    for await (const file of this.files) {
      try {
        const format = await this.checkFormat(file);

        if (format.isValid) {
          if ((format.type === 'audio' || format.type === 'video') && !format.ext) throw new Error();
          switch (format.type) {
            case "image":
              {
                const webp = await this.toWebp(file);
                outputFiles.push({ buffer: webp, type: 'image' });
              }
              break;
            case "video":
              {
                this.initFfmpeg();
                const mp4 = await this.toMp4(file, format.ext as FileExtension);
                if (mp4) outputFiles.push({ buffer: mp4, type: 'video' });
              }
              break;
            case "audio":
              {
                this.initFfmpeg();
                const mp3 = await this.toMp3(file, format.ext as FileExtension);
                if (mp3) outputFiles.push({ buffer: mp3, type: 'audio' });
              }
              break;
          }
        }
      // eslint-disable-next-line no-empty
      } catch (_) {}
    }
    return outputFiles;
  }
}
