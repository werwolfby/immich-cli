import { Command, ux } from '@oclif/core';
import { ImmichApi } from '../api/client';
import { UploadTarget } from './models/upload-target';

export async function uploadFiles(cmd: Command, api: ImmichApi, targets: UploadTarget[]): Promise<void> {
  const actionName = 'Uploading';
  ux.action.type = 'spinner';
  ux.action.start(actionName);

  try {
    for (const target of targets) {
      ux.action.start(actionName, target.path);
    }
  } catch {
    cmd.error('Failed to upload files');
  }

  ux.action.stop('🟩');
}
