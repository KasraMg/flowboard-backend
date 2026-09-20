import { Injectable } from '@nestjs/common';
import ImageKit, { toFile } from '@imagekit/nodejs';

@Injectable()
export class ImageKitService {
  private readonly client: ImageKit;

  constructor() {
    this.client = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    });
  }

  async uploadImage(file: Buffer, fileName: string) {
    const uploadableFile = await toFile(file, fileName);
    console.log(process.env.IMAGEKIT_PRIVATE_KEY);

    return this.client.files.upload({
      file: uploadableFile,
      fileName,
    });
  }

  async deleteFile(fileId: string) {
    return this.client.files.delete(fileId);
  }
}
