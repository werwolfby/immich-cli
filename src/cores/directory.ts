import { UploadTarget } from './models/upload-target';
import { Command, ux } from '@oclif/core';
import * as fs from 'node:fs';
import { fdir } from 'fdir';
import * as mime from 'mime-types';
import { ACCEPTED_MIME_TYPES } from './constants';

export async function checkDirectory(cmd: Command, path: string): Promise<void> {
  ux.action.start('Checking directory');

  if (!fs.existsSync(path)) {
    cmd.error(`Directory '${path}' does not exist`, {
      exit: 1,
    });
  }

  ux.action.stop('🟩');
}

export async function indexDirectory(cmd: Command, path: string): Promise<UploadTarget[]> {
  const result: UploadTarget[] = [];
  const actionName = 'Indexing';

  ux.action.start(actionName, `Crawling around ${path}`);
  const paths = (await new fdir().withFullPaths().crawl(path).withPromise()) as string[];

  for (const path of paths) {
    if (filter(path)) {
      result.push(new UploadTarget(path));
    }
  }

  ux.action.stop('🟩');

  return result;
}

function filter(path: string): boolean {
  return ACCEPTED_MIME_TYPES.includes(mime.lookup(path) as string);
}
