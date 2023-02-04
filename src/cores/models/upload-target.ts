import * as fs from 'node:fs';
import { basename } from 'node:path';

export class UploadTarget {
  public path: string;

  public id: string;

  constructor(path: string) {
    this.path = path;

    const stats = fs.statSync(this.path);
    this.id = `${basename(this.path)}-${stats.size}`.replace(/\s+/g, '');
  }
}
