import { AssetTypeEnum } from 'immich-sdk';
import * as fs from 'fs';
import * as mime from 'mime-types';
import { basename } from 'node:path';
import * as path from 'path';

export class UploadTarget {
  public path: string;

  public assetType?: AssetTypeEnum;
  public assetData?: Buffer;
  public deviceAssetId?: string;
  public fileCreatedAt?: string;
  public fileModifiedAt?: string;
  public fileExtension?: string;
  public sidecarData?: Buffer;
  public sidecarPath?: string;

  constructor(path: string) {
    this.path = path;
  }

  async read() {
    this.assetData = await fs.promises.readFile(this.path);
    const stats = fs.statSync(this.path);
    this.deviceAssetId = `${basename(this.path)}-${stats.size}`.replace(/\s+/g, '');
    const mimeType = mime.lookup(this.path);
    if (!mimeType) {
      throw Error('Cannot determine mime type of asset: ' + this.path);
    }
    this.assetType = mimeType.split('/')[0].toUpperCase() as AssetTypeEnum;
    this.fileCreatedAt = stats.ctime.toISOString();
    this.fileModifiedAt = stats.mtime.toISOString();
    this.fileExtension = path.extname(this.path);
    let hasSidecar = true;

    // TODO: doesn't xmp replace the file extension?
    const sideCarPath = `${this.path}.xmp`;
    try {
      fs.accessSync(sideCarPath, fs.constants.R_OK);
    } catch (err) {
      // No sidecar file
      hasSidecar = false;
    }
    if (hasSidecar) {
      this.sidecarPath = `${this.path}.xmp`;
      this.sidecarData = await fs.promises.readFile(this.sidecarPath);
    }
  }
}
