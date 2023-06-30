import axios, { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';

export class UploadService {
  private readonly uploadConfig: AxiosRequestConfig;

  constructor(uploadConfig: AxiosRequestConfig) {
    this.uploadConfig = uploadConfig;
  }

  public upload(data: FormData): Promise<void> {
    this.uploadConfig.data = data;

    // TODO: retry on 500 errors?
    //await axios(axiosUploadConfig);
    return axios(this.uploadConfig);
  }
}
