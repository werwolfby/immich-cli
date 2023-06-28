import { ServerVersionReponseDto } from 'immich-sdk';
import { BaseCommand } from '../cli/base-command';

export default class ServerInfo extends BaseCommand {
  static description = 'Display server information';
  static enableJsonFlag = true;

  public async run(): Promise<ServerVersionReponseDto> {
    console.log('Getting server information');

    await this.connect();
    const { data: versionInfo } = await this.immichApi.serverInfoApi.getServerVersion();

    ux.table([{ key: 'Server Version', value: `v${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}` }], {
      key: { header: 'Property' },
      value: { header: 'Value', minWidth: 20 },
    });

    return versionInfo;
  }
}
