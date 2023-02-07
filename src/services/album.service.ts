import { UploadTarget } from '../cores';
import path from 'node:path';
export class AlbumService {
  createAlbumStructureFromPath(targets: UploadTarget[]) {
    const albums = new Map<string, UploadTarget[]>();
    for (const target of targets) {
      const albumName = target.path.split(path.sep).slice(-2)[0];
      if (!albums.has(albumName)) {
        albums.set(albumName, []);
      }

      albums.get(albumName)?.push(target);
    }

    return albums;
  }
}
