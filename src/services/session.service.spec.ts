import { Config } from '@oclif/core';
import { SessionService } from './session.service';
import { Options } from '@oclif/core/lib/interfaces/plugin';
import mockfs from 'mock-fs';
import fs from 'node:fs';
import yaml from 'yaml';
import { AuthConfig } from '../cores/models/auth-config';

const mockPingServer = jest.fn(() => Promise.resolve({ data: { res: 'pong' } }));
const mockUserInfo = jest.fn(() => Promise.resolve({ data: { email: 'admin@example.com' } }));

jest.mock('immich-sdk', () => {
  return {
    __esModule: true,
    ...jest.requireActual('immich-sdk'),
    UserApi: jest.fn().mockImplementation(() => {
      return { getMyUserInfo: mockUserInfo };
    }),
    ServerInfoApi: jest.fn().mockImplementation(() => {
      return { pingServer: mockPingServer };
    }),
  };
});

const mockOptions = class implements Options {
  root: string = 'blargh';
};

describe('SessionService', () => {
  let sessionService: SessionService;
  beforeAll(() => {
    console.log();
  });

  beforeEach(() => {
    mockfs({
      '/auth.yml': 'apiKey: pNussssKSYo5WasdgalvKJ1n9kdvaasdfbluPg\ninstanceUrl: https://test/api',
    });

    const config = new Config(new mockOptions());
    config.configDir = '/';

    sessionService = new SessionService(config);
  });

  it('should connect to immich', async () => {
    await sessionService.connect();
    expect(mockPingServer).toHaveBeenCalledTimes(1);
  });

  it('should error if no auth file exists', async () => {
    mockfs();
    await sessionService.connect().catch((error) => {
      expect(error.message).toEqual('Cannot load existing session. Please login first');
    });
  });

  it('should create auth file when logged in', async () => {
    mockfs();

    await sessionService.keyLogin('https://test/api', 'pNussssKSYo5WasdgalvKJ1n9kdvaasdfbluPg');

    const data: string = await fs.promises.readFile('/auth.yml', 'utf8');
    const authConfig = yaml.parse(data) as AuthConfig;
    expect(authConfig.instanceUrl).toBe('https://test/api');
    expect(authConfig.apiKey).toBe('pNussssKSYo5WasdgalvKJ1n9kdvaasdfbluPg');
  });

  afterEach(() => {
    mockfs.restore();
  });
});
