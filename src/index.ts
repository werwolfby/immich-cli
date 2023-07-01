import { program, Option } from 'commander';
import Upload from './commands/upload';
import ServerInfo from './commands/server-info';
import LoginKey from './commands/login/key';

program.name('immich').description('Immich command line interface');

program
  .command('upload')
  .description('Upload assets to an Immich instance')
  .usage('upload [options] [paths...]')
  .addOption(new Option('-r, --recursive', 'Recursive').env('IMMICH_RECURSIVE').default(false))
  .addOption(new Option('-h, --skip-hash', "Don't hash files before upload").env('IMMICH_SKIP_HASH').default(false))
  .addOption(new Option('-da, --delete', 'Delete local assets after upload').env('IMMICH_DELETE_ASSETS'))
  .addOption(
    new Option('-t, --threads <num>', 'Amount of concurrent upload threads (default=5)').env('IMMICH_UPLOAD_THREADS'),
  )
  .addOption(
    new Option('-al, --album [album]', 'Create albums for assets based on the parent folder or a given name').env(
      'IMMICH_CREATE_ALBUMS',
    ),
  )
  .addOption(new Option('-i, --import', 'Import instead of upload').env('IMMICH_IMPORT').default(false))
  .argument('[paths...]', 'One or more paths to assets to be uploaded')
  .action((paths, options) => {
    if (paths.length === 0) {
      // If no path argument is given, check if an env variable is set
      const envPath = process.env.IMMICH_ASSET_PATH;
      if (!envPath) {
        console.log('Error: Must specify at least one path');
        process.exit(1);
      } else {
        paths = [envPath];
      }
    }
    new Upload().run(paths, options.recursive, options.skipHash);
  });

program
  .command('server-info')
  .description('Display server information')

  .action(() => {
    new ServerInfo().run();
  });

program
  .command('login-key')
  .description('Login using an API key')
  .argument('[instanceUrl]')
  .argument('[apiKey]')
  .action((paths, options) => {
    new LoginKey().run(paths, options);
  });

program.parse(process.argv);
