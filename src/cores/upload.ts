import { Command, ux } from '@oclif/core';
import { ImmichApi } from '../api/client';
import { UploadTarget } from './models/upload-target';
import * as mime from 'mime-types';
import * as fs from 'node:fs';
import axios, { AxiosRequestConfig } from 'axios';
import { stat } from 'node:fs/promises';
import path = require('node:path');
import FormData from 'form-data';

export async function uploadFiles(
  cmd: Command,
  api: ImmichApi,
  targets: UploadTarget[],
  deviceId: string,
): Promise<void> {
  const actionName = 'Uploading';
  ux.action.type = 'spinner';
  ux.action.start(actionName);

  try {
    for (const target of targets) {
      ux.action.start(actionName, target.path);
      await upload(cmd, api, target, deviceId);
    }
  } catch {
    cmd.error('Failed to upload files');
  }

  ux.action.stop('🟩');
}

async function upload(cmd: Command, api: ImmichApi, target: UploadTarget, deviceId: string): Promise<void> {
  const fileStat = await stat(target.path);

  const data = new FormData();
  data.append('deviceAssetId', target.id);
  data.append('deviceId', deviceId);
  data.append('assetType', getFileType(target.path));
  data.append('createdAt', fileStat.mtime.toISOString());
  data.append('modifiedAt', fileStat.mtime.toISOString());
  data.append('isFavorite', JSON.stringify(false));
  data.append('fileExtension', path.extname(target.path));
  data.append('duration', '0:00:00.000000');
  data.append('assetData', fs.createReadStream(target.path));

  const config: AxiosRequestConfig<any> = {
    method: 'post',
    maxRedirects: 0,
    url: `${api.serverUrl}/asset/upload`,
    headers: {
      'x-api-key': api.key,
      ...data.getHeaders(),
    },
    maxContentLength: Number.POSITIVE_INFINITY,
    maxBodyLength: Number.POSITIVE_INFINITY,
    data: data,
  };

  try {
    await axios(config);
  } catch {
    cmd.error(`Failed to upload file: ${target.path}`);
  }
}

function getFileType(filePath: string): string {
  return (mime.lookup(filePath) as string).split('/')[0].toUpperCase();
}
