import { BaseCommand } from '../cli/base-command';

export default class Logout extends BaseCommand<typeof Logout> {
  public static readonly description = 'Logout and remove persisted credentials';

  public async run(): Promise<void> {
    this.debug('Executing logout flow...');

    await this.sessionService.logout();

    this.log('Successfully logged out');
  }
}
