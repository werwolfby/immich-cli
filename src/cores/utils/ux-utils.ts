import { ux } from '@oclif/core';
import { ServerVersionReponseDto } from 'immich-sdk';

export function buildTableInfo(
  serverNameHref: string,
  userEmail: string,
  serverVersion: ServerVersionReponseDto,
): void {
  ux.table(
    [
      { key: 'Address', value: serverNameHref },
      { key: 'Version', value: `v${serverVersion.major}.${serverVersion.minor}.${serverVersion.patch}` },
      { key: 'Admin Email', value: userEmail },
    ],
    {
      key: { header: 'Property' },
      value: { header: 'Value', minWidth: 20 },
    },
  );
}
