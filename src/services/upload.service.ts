import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { exit } from 'process';

export class UploadService {
  private readonly uploadConfig: any;
  private readonly checkAssetExistenceConfig: any;

  constructor(axiosConfig: any) {
    // TODO: This isn't very clean
    this.uploadConfig = JSON.parse(JSON.stringify(axiosConfig));
    this.uploadConfig.url = this.uploadConfig.url + '/asset/upload';
    this.uploadConfig.maxContentLength = Number.POSITIVE_INFINITY;
    this.uploadConfig.maxBodyLength = Number.POSITIVE_INFINITY;

    this.checkAssetExistenceConfig = JSON.parse(JSON.stringify(axiosConfig));
    this.checkAssetExistenceConfig.url = this.checkAssetExistenceConfig.url + '/asset/bulk-upload-check';

    const headers = this.checkAssetExistenceConfig.headers;
    if (headers) {
      headers['Content-Type'] = 'application/json';
    }
    this.checkAssetExistenceConfig.headers = headers;
  }

  public checkIfAssetAlreadyExists(path: string, checksum: string): Promise<any> {
    this.checkAssetExistenceConfig.data = JSON.stringify({ assets: [{ id: path, checksum: checksum }] });

    // TODO: retry on 500 errors?
    return axios(this.checkAssetExistenceConfig);
  }

  public upload(data: FormData): Promise<any> {
    this.uploadConfig.data = data;

    // TODO: retry on 500 errors?
    return axios(this.uploadConfig);
  }
}
