import { ImmichApi } from '../api/client';
import { Command, ux } from '@oclif/core';

export async function authenticateUser(cmd: Command, api: ImmichApi, key: string, server: URL): Promise<void> {
  ux.action.start('Authenticating');
  try {
    await api.userApi.getMyUserInfo();
  } catch {
    cmd.error(`Failed to authenticate user with key '${key}' and server '${server}'`);
  }

  ux.action.stop('🟩');
}
