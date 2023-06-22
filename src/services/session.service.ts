import fs from 'node:fs';
import { Config } from '@oclif/core';
import yaml from 'yaml';
import path from 'node:path';
import { ImmichApi } from '../api/client';
import { AuthConfig } from '../cores/models/auth-config';

export class SessionService {
  readonly config!: Config;
  readonly configDir: string;
  readonly authPath!: string;

  constructor(config: Config) {
    this.config = config;
    this.configDir = this.config.configDir;
    this.authPath = path.join(this.configDir, 'auth.yml');
  }

  public async connect(): Promise<ImmichApi> {
    let authConfig: AuthConfig;
    try {
      authConfig = yaml.parse(fs.readFileSync(this.authPath, 'utf8')) as AuthConfig;
    } catch (error) {
      console.log(error);
      throw error;
    }

    const api = new ImmichApi(authConfig.instanceUrl, authConfig.apiKey);

    const { data: pingResponse } = await api.serverInfoApi.pingServer().catch((error) => {
      console.error(`Failed to connect to the server: ${error.message}`);
      throw error;
    });

    if (pingResponse.res !== 'pong') {
      throw new Error('Unexpected ping reply');
    }

    return api;
  }
}
