import { Config } from '@oclif/core';
import { SessionService } from './session.service';
import { Options } from '@oclif/core/lib/interfaces/plugin';
import { ServerInfoApi } from 'immich-sdk';
import mockfs from 'mock-fs';

const mockOptions = class implements Options {
  root: string = 'blargh';
};
const mockPingServer = jest.fn(() => Promise.resolve({ data: { res: 'pong' } }));
jest.mock('immich-sdk', () => {
  return {
    __esModule: true,
    ...jest.requireActual('immich-sdk'),
    ServerInfoApi: jest.fn().mockImplementation(() => {
      return { pingServer: mockPingServer };
    }),
  };
});

describe('SessionService', () => {
  let sessionService: SessionService;
  beforeEach(() => {
    mockfs({
      '/auth.yml': 'apiKey: pNussssKSYo5WasdgalvKJ1n9kdvaasdfbluPg\ninstanceUrl: https://test/api',
    });

    let config = new Config(new mockOptions());
    config.configDir = '/';

    sessionService = new SessionService(config);
  });

  it('should connect to immich', async () => {
    await sessionService.connect();
    expect(mockPingServer).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    mockfs.restore();
  });
});
