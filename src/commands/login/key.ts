import { BaseCommand } from '../../cli/base-command';

export default class LoginKey extends BaseCommand {
  public async run(): Promise<void> {
    console.log('Executing API key auth flow...');
    const instanceUrl = this.flags['instance-url'];
    const apiKey = this.flags['api-key'];

    await this.sessionService.keyLogin(instanceUrl, apiKey);
  }
}
