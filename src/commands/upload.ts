import { Observable, Subject } from 'rxjs';
import { BaseCommand } from '../cli/base-command';
import { UploadOptions, UploadTarget } from '../cores';
import { AlbumService, CrawlService, UploadService } from '../services';
import * as si from 'systeminformation';
import { UploadEvent } from '../cores/models/upload-event';

export default class Upload extends BaseCommand {
  private crawlService = new CrawlService();
  private uploadService!: UploadService;

  public async run(paths: string[], recursive: boolean): Promise<void> {
    await this.connect();
    const crawledFiles: string[] = await this.crawlService.crawl(paths, recursive);
    const uuid = await si.uuid();
    const deviceId: string = uuid.os || 'CLI';
    this.uploadService = new UploadService(this.immichApi, deviceId);
    const uploadTargets = crawledFiles.map((path) => new UploadTarget(path));

    this.uploadService.uploadFiles(uploadTargets);
    console.log('Upload successful');
  }
}
