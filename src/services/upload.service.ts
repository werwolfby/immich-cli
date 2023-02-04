import { UploadDto } from '../cores/models/upload-dto';
import { Command, ux } from '@oclif/core';
import { ImmichApi } from '../api/client';
import { DirectoryService } from './directory.service';
import { UploadTarget } from '../cores';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import fs from 'node:fs';
import mime from 'mime-types';
import FormData from 'form-data';
import axios, { AxiosRequestConfig } from 'axios';

export class UploadService {
  private readonly immichApi: ImmichApi;
  private readonly command: Command;
  private readonly directoryService: DirectoryService;
  private readonly dto: UploadDto;

  constructor(command: Command, immichApi: ImmichApi, dto: UploadDto) {
    this.directoryService = new DirectoryService(command);

    this.immichApi = immichApi;
    this.command = command;
    this.dto = dto;
  }

  public async execute(): Promise<void> {
    await this.directoryService.checkDirectory(this.dto.directory);
    const local = await this.directoryService.indexDirectory(this.dto.directory);
    const remote = await this.getUploadedAssetIds();
    const toUpload = local.filter((x) => !remote.includes(x.id));
    let confirm = await ux.prompt(`Found ${toUpload.length} files to upload. Proceed? (yes/no)`, { type: 'normal' });

    while (confirm !== 'yes' && confirm !== 'no') {
      this.command.log('Please enter yes or no');
      confirm = await ux.prompt(`Found ${toUpload.length} files to upload. Proceed? (yes/no)`, { type: 'normal' });
    }

    if (confirm === 'yes') {
      await this.uploadFiles(toUpload);
    }
  }

  private async getUploadedAssetIds(): Promise<string[]> {
    const { data } = await this.immichApi.assetApi.getUserAssetsByDeviceId(this.dto.deviceId);
    return data;
  }

  private async uploadFiles(targets: UploadTarget[]): Promise<void> {
    const actionName = 'Uploading';
    ux.action.type = 'spinner';
    ux.action.start(actionName);

    try {
      for (const target of targets) {
        ux.action.start(actionName, target.path);
        await this.upload(target);
      }
    } catch {
      this.command.error('Failed to upload files');
    }

    ux.action.stop('🟩');
  }

  async upload(target: UploadTarget): Promise<void> {
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
      this.command.error(`Failed to upload file: ${target.path}`);
    }
  }

  private getFileType(filePath: string): string {
    return (mime.lookup(filePath) as string).split('/')[0].toUpperCase();
  }
}
