import { Flags, ux } from '@oclif/core';
import { BaseCommand } from '../cli/base-command';
import { UploadOptions } from '../cores';
import { DirectoryService, UploadService } from '../services';

// ./bin/dev upload -k 7asgQAUoQ4y2R3uJXuVHBv3mqyuGF3NR7lRTACRtxNw -s http://10.1.15.216:2283/api
// ./bin/run upload -k 7asgQAUoQ4y2R3uJXuVHBv3mqyuGF3NR7lRTACRtxNw -s http://10.1.15.216:2283/api

export default class Upload extends BaseCommand<typeof Upload> {
  static description = "Upload images and videos in a directory to Immich's server";

  static flags = {
    directory: Flags.string({ char: 'd', required: true, description: 'Directory to upload from' }),
    watch: Flags.boolean({ char: 'w', description: 'Enable watch mode', default: false }),
  };

  private directoryService!: DirectoryService;
  private uploadService!: UploadService;

  public async run(): Promise<void> {
    const options = new UploadOptions();
    options.deviceId = this.deviceId;
    options.directory = this.flags.directory;

    this.directoryService = new DirectoryService();
    this.uploadService = new UploadService(this.immichApi, options);

    await (this.flags.watch ? this.watch() : this.runOnce());
  }

  async watch(): Promise<void> {
    console.log('watch dir');
  }

  async runOnce(): Promise<void> {
    ux.action.start('Upload');

    ux.action.start('Upload', 'Indexing files');
    const local = await this.directoryService.buildUploadTarget(this.flags.directory);
    const remote = await this.uploadService.getUploadedAssetIds();
    const toUpload = local.filter((x) => !remote.includes(x.id));

    if (toUpload.length === 0) {
      ux.action.stop(`Found ${local.length} files at target directory, all have been uploaded!`);
      this.exit(0);
    } else {
      ux.action.stop(`Found ${local.length} files at target directory, ${toUpload.length} new files will be uploaded`);
    }

    let confirm = await ux.prompt('Proceed?(yes/no)', { type: 'normal' });
    while (confirm !== 'yes' && confirm !== 'no') {
      this.log('Please enter yes or no');
      confirm = await ux.prompt('Proceed?(yes/no)', { type: 'normal' });
    }

    if (confirm === 'yes') {
      await this.uploadService.uploadFiles(toUpload);
    }

    this.exit(0);
  }
}
