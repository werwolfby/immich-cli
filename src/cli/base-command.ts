import { Command, Flags, Interfaces } from '@oclif/core';
import { ServerVersionReponseDto, UserResponseDto } from 'immich-sdk/dist/api';
import * as si from 'systeminformation';
import { ImmichApi } from '../api/client';
import path from 'node:path';

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<(typeof BaseCommand)['baseFlags'] & T['flags']>;
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>;

export abstract class BaseCommand<T extends typeof Command> extends Command {
  protected flags!: Flags<T>;
  protected args!: Args<T>;

  protected immichApi!: ImmichApi;
  protected deviceId!: string;
  protected user!: UserResponseDto;
  protected serverVersion!: ServerVersionReponseDto;

  protected authPath = path.join(this.config.configDir, 'auth.yml');
  protected configDir = this.config.configDir;

  public async init(): Promise<void> {
    await super.init();

    const { args, flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      args: this.ctor.args,
      strict: this.ctor.strict,
    });

    this.flags = flags as Flags<T>;
    this.args = args as Args<T>;
    this.deviceId = (await si.uuid()).os || 'CLI';
  }
}
