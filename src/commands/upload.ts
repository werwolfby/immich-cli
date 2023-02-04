import { Flags } from '@oclif/core';
import { BaseCommand } from '../cli/base-command';
import { checkDirectory, authenticateUser, indexDirectory, uploadFiles } from '../cores';
import { ImmichApi } from '../api/client';

// 7asgQAUoQ4y2R3uJXuVHBv3mqyuGF3NR7lRTACRtxNw
// http://10.1.15.216:2283/api
// ./bin/dev upload -k 7asgQAUoQ4y2R3uJXuVHBv3mqyuGF3NR7lRTACRtxNw -s http://10.1.15.216:2283/api
// ./bin/run upload -k 7asgQAUoQ4y2R3uJXuVHBv3mqyuGF3NR7lRTACRtxNw -s http://10.1.15.216:2283/api

export default class Upload extends BaseCommand<typeof Upload> {
  static description = "Upload images and videos in a directory to Immich's server";

  static flags = {
    directory: Flags.string({ char: 'd', description: 'Directory to upload from', required: true }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(Upload).catch(() => {
      this.error('Missing required flags', { exit: 1, suggestions: ["Use --help to see the command's usage"] });
    });

    const apiClient = new ImmichApi(this.flags.server, this.flags.key);

    await authenticateUser(this, apiClient, flags.key, flags.server);
    await checkDirectory(this, flags.directory);
    const toUpload = await indexDirectory(this, flags.directory);
    await uploadFiles(this, apiClient, toUpload);

    this.log('Upload command ran successfully');
  }
}
