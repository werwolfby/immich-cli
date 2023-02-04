import { fdir } from 'fdir';
import { UploadTarget, ACCEPTED_MIME_TYPES } from '../cores';
import fs from 'node:fs';
import mime from 'mime-types';

export class DirectoryService {
  public async buildUploadTarget(path: string): Promise<UploadTarget[]> {
    if (!fs.existsSync(path)) {
      throw new Error('Path does not exist');
    }

    const result: UploadTarget[] = [];

    const paths = (await new fdir().withFullPaths().crawl(path).withPromise()) as string[];

    for (const path of paths) {
      if (this.filter(path)) {
        result.push(new UploadTarget(path));
      }
    }

    return result;
  }

  private filter(path: string): boolean {
    return ACCEPTED_MIME_TYPES.includes(mime.lookup(path) as string);
  }
}
