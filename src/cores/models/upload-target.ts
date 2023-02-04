import * as fs from 'node:fs';
import { basename } from 'node:path';

export class UploadTarget {
  public path: string;

  public get id(): string {
    const stats = fs.statSync(this.path);
    return `${basename(this.path)}-${stats.size}`.replace(/\s+/g, '');
  }

  constructor(path: string) {
    this.path = path;
  }
}
