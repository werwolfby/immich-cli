import { ServerVersionReponseDto } from 'immich-sdk';
import { BaseCommand } from '../cli/base-command';

export default class ServerVersion extends BaseCommand<typeof ServerVersion> {
  static description = 'Get the server version';
  static enableJsonFlag = true;

  public async run(): Promise<ServerVersionReponseDto> {
    this.debug('Getting server version');
    const { data: versionInfo } = await this.immichApi.serverInfoApi.getServerVersion();

    const version = `v${versionInfo.major}.${versionInfo.minor}.${versionInfo.patch}`;
    this.log(`Connected to Immich ${version} at ${this.flags.server}`);

    return versionInfo;
  }
}
