import { Flags } from '@oclif/core';
import { BaseCommand } from '../cli/base-command';
import { UploadDto } from '../cores';
import { UploadService } from '../services';

// ./bin/dev upload -k 7asgQAUoQ4y2R3uJXuVHBv3mqyuGF3NR7lRTACRtxNw -s http://10.1.15.216:2283/api
// ./bin/run upload -k 7asgQAUoQ4y2R3uJXuVHBv3mqyuGF3NR7lRTACRtxNw -s http://10.1.15.216:2283/api

export default class Upload extends BaseCommand<typeof Upload> {
  static description = "Upload images and videos in a directory to Immich's server";

  static flags = {
    directory: Flags.string({ char: 'd', required: true, description: 'Directory to upload from' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Upload).catch(() => {
      this.error('Missing required flags', { exit: 1, suggestions: ["Use --help to see the command's usage"] });
    });

    const uploadDto = new UploadDto();
    uploadDto.deviceId = this.deviceId;
    uploadDto.directory = flags.directory;

    const uploadService = new UploadService(this, this.immichApi, uploadDto);
    uploadService.execute();

    this.exit(0);
  }
}
