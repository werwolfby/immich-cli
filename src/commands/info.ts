import { ServerVersionReponseDto } from 'immich-sdk';
import { BaseCommand } from '../cli/base-command';

export default class Info extends BaseCommand<typeof Info> {
  static description = 'Get the server version';
  static enableJsonFlag = true;

  public async run(): Promise<ServerVersionReponseDto> {
    this.debug('Getting server version');
    const { data: versionInfo } = await this.immichApi.serverInfoApi.getServerVersion();

    return versionInfo;
  }
}
