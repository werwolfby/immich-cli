import mockfs from 'mock-fs';
import Upload from './upload';
import axios, { AxiosRequestConfig } from 'axios';
import { AssetTypeEnum } from 'immich-sdk';
import mockAxios from 'jest-mock-axios';
import { UploadTarget } from '../cores/models/upload-target';
import { ImmichApi } from '../api/client';
import FormData from 'form-data';
import { CrawlService, UploadService } from '../services';
import { SessionService } from '../services/session.service';

jest.mock('../services/session.service');
jest.mock('../services/upload.service');
jest.mock('../services/crawl.service');

describe('Upload', () => {
  let upload: Upload;

  const api = new ImmichApi('a', 'b');

  const uploadConfig: AxiosRequestConfig = {
    method: 'post',
    maxRedirects: 0,
    url: `http://example.com/asset/upload`,
    headers: {
      'x-api-key': 'test-key',
    },
    maxContentLength: Number.POSITIVE_INFINITY,
    maxBodyLength: Number.POSITIVE_INFINITY,
  };

  beforeAll(() => {
    // Write a dummy output before mock-fs to prevent some annoying errors
    console.log();
  });

  beforeEach(() => {
    upload = new Upload();
  });

  it('should upload a single file', async () => {
    const connectionMock = jest
      .spyOn(SessionService.prototype, 'connect')
      .mockImplementation(() => Promise.resolve(api));

    const crawlMock = jest
      .spyOn(CrawlService.prototype, 'crawl')
      .mockImplementation(() => Promise.resolve(['/photos/image.jpg']));

    await upload.run(['/photos'], false);
  });

  afterEach(() => {
    mockAxios.reset();
  });
});
