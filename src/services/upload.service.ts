import { UploadOptions } from '../cores/models/upload-options';
import { ImmichApi } from '../api/client';
import { UploadTarget } from '../cores';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import fs from 'node:fs';
import mime from 'mime-types';
import FormData from 'form-data';
import axios, { AxiosRequestConfig } from 'axios';

export class UploadService {
  private readonly immichApi: ImmichApi;
  private readonly options: UploadOptions;

  constructor(immichApi: ImmichApi, options: UploadOptions) {
    this.immichApi = immichApi;
    this.options = options;
  }

  public async getUploadedAssetIds(): Promise<string[]> {
    const { data } = await this.immichApi.assetApi.getUserAssetsByDeviceId(this.options.deviceId);
    return data;
  }

  public async uploadFiles(targets: UploadTarget[]): Promise<void> {
    for (const target of targets) {
      const fileStat = await stat(target.path);

      const data = new FormData();
      data.append('deviceAssetId', target.id);
      data.append('deviceId', this.options.deviceId);
      data.append('assetType', this.getFileType(target.path));
      data.append('createdAt', fileStat.mtime.toISOString());
      data.append('modifiedAt', fileStat.mtime.toISOString());
      data.append('isFavorite', JSON.stringify(false));
      data.append('fileExtension', path.extname(target.path));
      data.append('duration', '0:00:00.000000');
      data.append('assetData', fs.createReadStream(target.path));

      const config: AxiosRequestConfig<any> = {
        method: 'post',
        maxRedirects: 0,
        url: `${this.immichApi.serverUrl}/asset/upload`,
        headers: {
          'x-api-key': this.immichApi.key,
          ...data.getHeaders(),
        },
        maxContentLength: Number.POSITIVE_INFINITY,
        maxBodyLength: Number.POSITIVE_INFINITY,
        data: data,
      };

      try {
        await axios(config);
      } catch {
        console.log('error');
      }
    }
  }

  private getFileType(filePath: string): string {
    return (mime.lookup(filePath) as string).split('/')[0].toUpperCase();
  }
}
