import { Config } from '@oclif/core';
import { SessionService } from './session.service';
import { Options } from '@oclif/core/lib/interfaces/plugin';
import { ImmichApi } from '../api/client';

const mock = require('mock-fs');

const mockInstance = {
  serverInfoApi: {
    pingServer: jest.fn().mockResolvedValue('haha'),
  },
  // Add other mocked methods/properties of the ImmichApi instance if necessary
};

jest.mock('../api/client', () => {
  return {
    ImmichApi: jest.fn(),
  };
});

mock({
  '/auth.yml': 'apiKey: pNussssKSYo5WasdgalvKJ1n9kdvaasdfbluPg\ninstanceUrl: https://test/api',
});

const mockOptions = class implements Options {
  root: string = 'blargh';
};

describe('SessionService', () => {
  let sessionService: SessionService;

  beforeEach(async () => {
    let config = new Config(new mockOptions());
    config.configDir = '/';
    sessionService = new SessionService(config);
  });

  it('should connect to immich', async () => {
    await sessionService.connect();
    expect(ImmichApi).toBeCalledWith('https://test/api', 'pNussssKSYo5WasdgalvKJ1n9kdvaasdfbluPg');
  });

  afterEach(mock.restore);
});
