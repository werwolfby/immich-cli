import { ImmichApi } from './../api/client';
import { Command } from '@oclif/core';
import * as si from 'systeminformation';

export async function getAssets(cmd: Command, api: ImmichApi): Promise<string[]> {
  const deviceId = (await si.uuid()).os || 'CLI';

  const { data } = await api.assetApi.getUserAssetsByDeviceId(deviceId);

  return data;
}
