import { fdir } from 'fdir';
import mime from 'mime-types';
import fs from 'node:fs';
import { ACCEPTED_MIME_TYPES, UploadTarget } from '../cores';

export class DirectoryService {
  public async buildUploadTarget(path: string): Promise<UploadTarget[]> {
    if (!fs.existsSync(path)) {
      throw new Error('Path does not exist');
    }

    const result: UploadTarget[] = [];

    const paths = (await new fdir().withFullPaths().crawl(path).withPromise()) as string[];

    for (const path of paths) {
      if (this.filterAcceptedFileType(path)) {
        result.push(new UploadTarget(path));
      }
    }

    return result;
  }

  public filterAcceptedFileType(path: string): boolean {
    return ACCEPTED_MIME_TYPES.includes(mime.lookup(path) as string);
  }
}
