import { BaseCommand } from '../cli/base-command';
import fs from 'node:fs';
import yaml from 'yaml';

export default class Logout extends BaseCommand<typeof Logout> {
  public static readonly description = 'Logout and remove persisted credentials';

  public async run(): Promise<void> {
    this.debug('Logging out');

    // Check if server and api key are valid
    const { data: userInfo } = await this.immichApi.userApi.getMyUserInfo().catch((error) => {
      this.error(`Failed to connect to the server: ${error.message}`);
    });

    this.log(`Logged in as ${userInfo.email}`);

    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }

    fs.writeFileSync(this.authPath, yaml.stringify({ token: '' }));
  }
}
