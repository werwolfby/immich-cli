import { ImmichApi } from './../api/client';
import { Command } from '@oclif/core';

export async function getUploadedAssetIds(cmd: Command, api: ImmichApi, deviceId: string): Promise<string[]> {
  const { data } = await api.assetApi.getUserAssetsByDeviceId(deviceId);

  return data;
}
