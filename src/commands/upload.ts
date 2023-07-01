import { BaseCommand } from '../cli/base-command';
import { UploadTarget } from '../cores';
import { CrawlService, UploadService } from '../services';
import * as si from 'systeminformation';
import FormData from 'form-data';
import { UploadOptionsDto } from '../cores/dto/upload-options-dto';

export default class Upload extends BaseCommand {
  private crawlService = new CrawlService();
  private uploadService!: UploadService;

  public async run(paths: string[], options: UploadOptionsDto): Promise<void> {
    await this.connect();

    const uuid = await si.uuid();
    const deviceId: string = uuid.os || 'CLI';
    this.uploadService = new UploadService(this.immichApi.apiConfiguration);

    const crawledFiles: string[] = await this.crawlService.crawl(paths, options.recursive);

    const uploadTargets = crawledFiles.map((path) => new UploadTarget(path));
    const uploadLength = uploadTargets.length;
    let uploadCounter: number = 0;

    for (const target of uploadTargets) {
      await target.read();
      let skipUpload: boolean = false;
      if (!options.skipHash) {
        const checksum: string = await target.hash();

        const checkResponse = await this.uploadService.checkIfAssetAlreadyExists(target.path, checksum);
        skipUpload = checkResponse.data.results[0].action === 'reject';
      }

      if (!skipUpload) {
        const uploadFormData = new FormData();

        uploadFormData.append('assetType', target.assetType);
        uploadFormData.append('assetData', target.assetData, { filename: target.path });
        uploadFormData.append('deviceAssetId', target.deviceAssetId);
        uploadFormData.append('deviceId', deviceId);
        uploadFormData.append('fileCreatedAt', target.fileCreatedAt);
        uploadFormData.append('fileModifiedAt', target.fileModifiedAt);
        uploadFormData.append('isFavorite', String(false));
        uploadFormData.append('fileExtension', target.fileExtension);

        if (target.sidecarData) {
          uploadFormData.append('sidecarData', target.sidecarData, {
            filename: target.sidecarPath,
            contentType: 'application/xml',
          });
        }

        await this.uploadService.upload(uploadFormData);
      }

      uploadCounter++;
      if (skipUpload) {
        console.log(uploadCounter + '/' + uploadLength + ' skipped: ' + target.path);
      } else {
        console.log(uploadCounter + '/' + uploadLength + ' uploaded: ' + target.path);
      }
    }

    if (options.delete) {
      console.log('Upload successful, deleting uploaded assets');
      let deletionCounter: number = 0;

      for (const target of uploadTargets) {
        await target.delete();
        deletionCounter++;
        console.log(deletionCounter + '/' + uploadLength + ' deleted: ' + target.path);
      }
      console.log('Process complete');
    } else {
      console.log('Upload successful');
    }
  }
}
