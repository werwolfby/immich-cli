import fs from 'node:fs';
import { Config } from '@oclif/core';
import yaml from 'yaml';
import path from 'node:path';
import { ImmichApi } from '../api/client';
import { AuthConfig } from '../cores/models/auth-config';
import { exit } from 'node:process';

export class SessionService {
  readonly config!: Config;
  readonly configDir: string;
  readonly authPath!: string;
  private api!: ImmichApi;

  constructor(config: Config) {
    this.config = config;
    this.configDir = this.config.configDir;
    this.authPath = path.join(this.configDir, 'auth.yml');
  }

  public async connect(): Promise<ImmichApi> {
    fs.access(this.authPath, fs.constants.F_OK, (error) => {
      if (error) {
        console.error('Cannot load existing session. Please login first');
        exit(1);
      }
    });

    const data: string = await fs.promises.readFile(this.authPath, 'utf8');

    const authConfig = yaml.parse(data) as AuthConfig;

    this.api = new ImmichApi(authConfig.instanceUrl, authConfig.apiKey);

    await this.ping();

    return this.api;
  }

  public async keyLogin(instanceUrl: string, apiKey: string): Promise<ImmichApi> {
    this.api = new ImmichApi(instanceUrl, apiKey);

    // Check if server and api key are valid
    const { data: userInfo } = await this.api.userApi.getMyUserInfo().catch((error) => {
      console.error(`Failed to connect to the server: ${error.message}`);
      throw error;
    });

    console.log(`Logged in as ${userInfo.email}`);

    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }

    const authConfig: AuthConfig = new AuthConfig();
    authConfig.apiKey = apiKey;
    authConfig.instanceUrl = instanceUrl;

    fs.writeFileSync(this.authPath, yaml.stringify(authConfig));

    return this.api;
  }

  public async logout(): Promise<void> {
    if (fs.existsSync(this.authPath)) {
      fs.unlinkSync(this.authPath);
    }
  }

  private async ping(): Promise<void> {
    const { data: pingResponse } = await this.api.serverInfoApi.pingServer().catch((error) => {
      console.error(`Failed to connect to the server: ${error.message}`);
      throw error;
    });

    if (pingResponse.res !== 'pong') {
      throw new Error('Unexpected ping reply');
    }
  }
}
