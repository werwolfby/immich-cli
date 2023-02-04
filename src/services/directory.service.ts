import { Command, ux } from '@oclif/core';
import { fdir } from 'fdir';
import { UploadTarget, ACCEPTED_MIME_TYPES } from '../cores';
import fs from 'node:fs';
import mime from 'mime-types';

export class DirectoryService {
  private readonly command: Command;

  constructor(command: Command) {
    this.command = command;
  }

  public async checkDirectory(path: string): Promise<void> {
    ux.action.start('Checking directory');

    if (!fs.existsSync(path)) {
      this.command.error(`Directory '${path}' does not exist`, {
        exit: 1,
      });
    }

    ux.action.stop('🟩');
  }

  async indexDirectory(path: string): Promise<UploadTarget[]> {
    const result: UploadTarget[] = [];
    const actionName = 'Indexing';

    ux.action.start(actionName, `Crawling around ${path}`);
    const paths = (await new fdir().withFullPaths().crawl(path).withPromise()) as string[];

    for (const path of paths) {
      if (this.filter(path)) {
        result.push(new UploadTarget(path));
      }
    }

    ux.action.stop('🟩');

    return result;
  }

  private filter(path: string): boolean {
    return ACCEPTED_MIME_TYPES.includes(mime.lookup(path) as string);
  }
}
