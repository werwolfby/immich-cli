import { Flags, ux } from '@oclif/core';
import { BaseCommand } from '../cli/base-command';
import { checkDirectory, indexDirectory, uploadFiles, getUploadedAssetIds } from '../cores';

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

    await checkDirectory(this, flags.directory);

    const local = await indexDirectory(this, flags.directory);
    const remote = await getUploadedAssetIds(this, this.immichApi, this.deviceId);
    const toUpload = local.filter((x) => !remote.includes(x.id));

    let confirm = await ux.prompt(`Found ${toUpload.length} files to upload. Proceed? (yes/no)`, { type: 'normal' });

    while (confirm !== 'yes' && confirm !== 'no') {
      this.log('Please enter yes or no');
      confirm = await ux.prompt(`Found ${toUpload.length} files to upload. Proceed? (yes/no)`, { type: 'normal' });
    }

    if (confirm === 'yes') {
      await uploadFiles(this, this.immichApi, toUpload, this.deviceId);
    }

    this.exit(0);
  }
}
