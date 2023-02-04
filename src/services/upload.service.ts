import { UploadDto } from '../cores/models/upload-dto';
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
  private readonly dto: UploadDto;

  constructor(immichApi: ImmichApi, dto: UploadDto) {
    this.immichApi = immichApi;
    this.dto = dto;
  }

  // public async execute(): Promise<void> {
  //   await this.directoryService.check(this.dto.directory);

  //   const local = await this.directoryService.buildUploadTarget(this.dto.directory);
  //   const remote = await this.getUploadedAssetIds();

  //   const toUpload = local.filter((x) => !remote.includes(x.id));

  //   let confirm = await ux.prompt(`Found ${toUpload.length} files to upload. Proceed? (yes/no)`, { type: 'normal' });
  //   while (confirm !== 'yes' && confirm !== 'no') {
  //     this.command.log('Please enter yes or no');
  //     confirm = await ux.prompt(`Found ${toUpload.length} files to upload. Proceed? (yes/no)`, { type: 'normal' });
  //   }

  //   if (confirm === 'yes') {
  //     await this.uploadFiles(toUpload);
  //   }
  // }

  public async getUploadedAssetIds(): Promise<string[]> {
    const { data } = await this.immichApi.assetApi.getUserAssetsByDeviceId(this.dto.deviceId);
    return data;
  }

  public async uploadFiles(targets: UploadTarget[]): Promise<void> {
    for (const target of targets) {
      const fileStat = await stat(target.path);

      const data = new FormData();
      data.append('deviceAssetId', target.id);
      data.append('deviceId', this.dto.deviceId);
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
