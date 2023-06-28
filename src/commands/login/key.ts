import { BaseCommand } from '../../cli/base-command';

export default class LoginKey extends BaseCommand {
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
    console.log('Executing API key auth flow...');
    const instanceUrl = this.flags['instance-url'];
    const apiKey = this.flags['api-key'];

    await this.sessionService.keyLogin(instanceUrl, apiKey);
  }
}
