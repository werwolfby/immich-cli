import { BaseCommand } from '../cli/base-command';
import { UploadTarget } from '../cores';
import { CrawlService, UploadService } from '../services';
import * as si from 'systeminformation';
import FormData from 'form-data';

export default class Upload extends BaseCommand {
  private crawlService = new CrawlService();
  private uploadService!: UploadService;

  public async run(paths: string[], recursive: boolean): Promise<void> {
    await this.connect();

    const uuid = await si.uuid();
    const deviceId: string = uuid.os || 'CLI';
    this.uploadService = new UploadService(this.immichApi.getAxiosUploadConfig);

    const crawledFiles: string[] = await this.crawlService.crawl(paths, recursive);

    const uploadTargets = crawledFiles.map((path) => new UploadTarget(path));
    const uploadLength = uploadTargets.length;
    let uploadCounter: number = 0;

    for (const target of uploadTargets) {
      const formData = new FormData();
      await target.read();

      formData.append('assetType', target.assetType);
      formData.append('assetData', target.assetData, { filename: target.path });
      formData.append('deviceAssetId', target.deviceAssetId);
      formData.append('deviceId', deviceId);
      formData.append('fileCreatedAt', target.fileCreatedAt);
      formData.append('fileModifiedAt', target.fileModifiedAt);
      formData.append('isFavorite', String(false));
      formData.append('fileExtension', target.fileExtension);
      if (target.sidecarData) {
        formData.append('sidecarData', target.sidecarData, {
          filename: target.sidecarPath,
          contentType: 'application/xml',
        });
      }

      await this.uploadService.upload(formData);

      uploadCounter++;
      console.log(uploadCounter + '/' + uploadLength + ' uploaded: ' + target.path);
    }

    console.log('Upload successful');
  }
}
