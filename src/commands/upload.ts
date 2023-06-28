import { Subject } from 'rxjs';
import { BaseCommand } from '../cli/base-command';
import { UploadOptions } from '../cores';
import { AlbumService, CrawlService, UploadService } from '../services';
import * as si from 'systeminformation';

export default class Upload extends BaseCommand {
  private crawlService = new CrawlService();
  private uploadService!: UploadService;
  private albumService!: AlbumService;
  private files$ = new Subject();

  public async run(paths: string[], recursive: boolean): Promise<void> {
    await this.connect();
    const crawledFiles: string[] = await this.crawlService.crawl(paths, recursive);
    const uuid = await si.uuid();
    this.deviceId = uuid.os || 'CLI';

    const options = new UploadOptions();
    options.deviceId = this.deviceId;
  }
}
