import { AssetTypeEnum } from 'immich-sdk';
import * as fs from 'node:fs';
import * as mime from 'mime-types';
import { basename } from 'node:path';
import * as path from 'path';
import { buffer } from 'stream/consumers';

export class UploadTarget {
  public path: string;

  public assetType: AssetTypeEnum;
  public assetData: File;
  public deviceAssetId: string;
  public fileCreatedAt: string;
  public fileModifiedAt: string;
  public fileExtension: string;
  public sideCarData: File;

  constructor(filePath: string) {
    this.path = filePath;
    const fileBuffer = fs.readFileSync(filePath);
    this.assetData = new File(fileBuffer, filePath);
    const stats = fs.statSync(this.path);
    this.deviceAssetId = `${basename(this.path)}-${stats.size}`.replace(/\s+/g, '');
    const mimeType = mime.lookup(filePath);
    if (!mimeType) {
      throw Error('Cannot determine mime type of asset: ' + filePath);
    }
    this.assetType = mimeType.split('/')[0].toUpperCase() as AssetTypeEnum;
    this.fileCreatedAt = stats.ctime.toISOString();
    this.fileModifiedAt = stats.mtime.toISOString();
    this.fileExtension = path.extname(filePath);
  }
}
