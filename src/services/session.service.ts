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
