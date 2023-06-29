import { ImmichApi } from '../api/client';
import { UploadTarget } from '../cores';
import { stat } from 'node:fs/promises';
import mime from 'mime-types';
import { Subject } from 'rxjs';
import { UploadEvent } from '../cores/models/upload-event';
import { File } from 'buffer';

export class UploadService {
  private readonly immichApi: ImmichApi;
  private readonly deviceId: string;

  constructor(immichApi: ImmichApi, deviceId: string) {
    this.immichApi = immichApi;
    this.deviceId = deviceId;
  }

  public async uploadFiles(targets: UploadTarget[], uploadEvent$: Subject<UploadEvent>): Promise<void> {
    let uploadLength = targets.length;
    for (const target of targets) {
      const fileStat = await stat(target.path);

      const uploadEvent = new UploadEvent();
      uploadEvent.fileName = target.path;
      uploadEvent.remainder = uploadLength;
      uploadEvent$.next(uploadEvent);

      await this.immichApi.assetApi.uploadFile(
        target.assetType,
        target.assetData,
        target.deviceAssetId,
        this.deviceId,
        target.fileCreatedAt,
        target.fileModifiedAt,
        false,
        target.fileExtension,
      );

      uploadEvent.remainder = uploadLength--;
      uploadEvent$.next(uploadEvent);
    }
  }

  private getFileType(filePath: string): string {
    return (mime.lookup(filePath) as string).split('/')[0].toUpperCase();
  }
}
