import { Flags } from '@oclif/core';
import { BaseCommand } from '../../cli/base-command';
import fs from 'node:fs';
import { ImmichApi } from '../../api/client';
import yaml from 'yaml';
import { AuthConfig } from '../../cores/models/auth-config';

export default class LoginKey extends BaseCommand<typeof LoginKey> {
  public static readonly description = 'Login using an API key';

  public static flags = {
    'instance-url': Flags.string({
      summary: 'URL of Immich instance',
      char: 'i',
      helpValue: '<value>',
      required: true,
    }),
    'api-key': Flags.string({
      summary: 'API key.',
      char: 'k',
      helpValue: '<value>',
      required: true,
    }),
  };

  public async run(): Promise<void> {
    this.debug('Executing API key auth flow...');
    const instanceUrl = this.flags['instance-url'];
    const apiKey = this.flags['api-key'];

    this.immichApi = new ImmichApi(instanceUrl, apiKey);

    // Check if server and api key are valid
    const { data: userInfo } = await this.immichApi.userApi.getMyUserInfo().catch((error) => {
      this.error(`Failed to connect to the server: ${error.message}`);
    });

    this.log(`Logged in as ${userInfo.email}`);

    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }

    const authConfig: AuthConfig = new AuthConfig();
    authConfig.apiKey = apiKey;
    authConfig.instanceUrl = instanceUrl;

    fs.writeFileSync(this.authPath, yaml.stringify(authConfig));
  }
}
