import { UploadService } from './upload.service';
import mockfs from 'mock-fs';

import axios, { AxiosRequestConfig } from 'axios';
import { AssetTypeEnum } from 'immich-sdk';
import mockAxios from 'jest-mock-axios';
import { UploadTarget } from '../cores/models/upload-target';
import { ImmichApi } from '../api/client';
import FormData from 'form-data';

jest.mock('immich-sdk');

describe('UploadService', () => {
  let uploadService: UploadService;

  const api = new ImmichApi('', 'b');

  let target: UploadTarget;

  beforeAll(() => {
    // Write a dummy output before mock-fs to prevent some annoying errors
    console.log();
  });

  beforeEach(() => {
    const mockConfig: AxiosRequestConfig<any> = {
      method: 'post',
      maxRedirects: 0,
      url: `https://example.com/asset/upload`,
      headers: {
        'x-api-key': 'key',
      },
      maxContentLength: Number.POSITIVE_INFINITY,
      maxBodyLength: Number.POSITIVE_INFINITY,
    };

    uploadService = new UploadService(mockConfig);
  });

  it('should upload a single file', async () => {
    const data = new FormData();
    data.append('assetType', 'image');

    uploadService.upload(data);

    mockAxios.mockResponse();
    expect(axios).toHaveBeenCalled();
  });

  afterEach(() => {
    mockfs.restore();
    mockAxios.reset();
  });
});
