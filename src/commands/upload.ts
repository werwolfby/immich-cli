import { Command, Flags } from '@oclif/core'
import { BaseCommand } from '../cli/baseCommand'

export default class Upload extends BaseCommand<typeof Upload> {
  static description = "Upload images and videos in a directory to Immich's server"

  static flags = {
    // flag with a value (-n, --name=VALUE)
    name: Flags.string({ char: 'n', description: 'name to print' }),
    // flag with no value (-f, --force)
    force: Flags.boolean({ char: 'f' }),
  }

  public async run(): Promise<void> {
    this.log(this.flags.name)

    this.log("Not implemented yet :)")
  }
}
