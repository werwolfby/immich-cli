import { AssetTypeEnum } from 'immich-sdk';
import * as fs from 'node:fs';
import * as mime from 'mime-types';
import { basename } from 'node:path';
import * as path from 'path';

export class UploadTarget {
  public path: string;

  public assetType: AssetTypeEnum;
  public assetData: File;
  public deviceAssetId: string;
  public fileCreatedAt: string;
  public fileModifiedAt: string;
  public fileExtension: string;
  public sideCarData: File | undefined;

  constructor(filePath: string) {
    this.path = filePath;
    const fileContentBuffer: Buffer = fs.readFileSync(filePath);
    this.assetData = new File([fileContentBuffer], filePath);
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
    let hasSidecar = true;
    const sideCarPath = `${filePath}.xmp`;
    try {
      fs.accessSync(sideCarPath, fs.constants.R_OK);
    } catch (err) {
      // No sidecar file
      hasSidecar = false;
    }
    if (hasSidecar) {
      const sideCarBuffer: Buffer = fs.readFileSync(filePath);
      this.sideCarData = new File([sideCarBuffer], sideCarPath);
    }
  }
}
