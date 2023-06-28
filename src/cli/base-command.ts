import { ServerVersionReponseDto, UserResponseDto } from 'immich-sdk/dist/api';
import { ImmichApi } from '../api/client';
import path from 'node:path';
import { SessionService } from '../services/session.service';

export abstract class BaseCommand {
  protected sessionService!: SessionService;
  protected immichApi!: ImmichApi;
  protected deviceId!: string;
  protected user!: UserResponseDto;
  protected serverVersion!: ServerVersionReponseDto;

  protected configDir;
  protected authPath;

  constructor() {
    const os = require('os');
    const userHomeDir = os.homedir();
    this.configDir = path.join(userHomeDir, '.config/immich/');
    this.sessionService = new SessionService(this.configDir);
    this.authPath = path.join(this.configDir, 'auth.yml');
  }

  public async connect(): Promise<void> {
    this.immichApi = await this.sessionService.connect();
  }
}
