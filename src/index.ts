import { program, Option } from 'commander';

program.name('immich').description('Immich command line interface');

program
  .command('upload')
  .description('Upload assets to an Immich instance')
  .usage('upload [options] <paths...>')
  .addOption(new Option('-k, --key <value>', 'API Key').env('IMMICH_API_KEY'))
  .addOption(
    new Option(
      '-s, --server <value>',
      'Immich server address (http://<your-ip>:2283/api or https://<your-domain>/api)',
    ).env('IMMICH_SERVER_ADDRESS'),
  )
  .addOption(new Option('-r, --recursive', 'Recursive').env('IMMICH_RECURSIVE').default(false))
  .addOption(new Option('-y, --yes', 'Assume yes on all interactive prompts').env('IMMICH_ASSUME_YES'))
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
  .addOption(new Option('-id, --device-uuid <value>', 'Set a device UUID').env('IMMICH_DEVICE_UUID'))
  .addOption(
    new Option(
      '-d, --directory <value>',
      'Upload assets recursively from the specified directory (DEPRECATED, use path argument with --recursive instead)',
    ).env('IMMICH_TARGET_DIRECTORY'),
  )
  .argument('[paths...]', 'One or more paths to assets to be uploaded')
  .action((paths, options) => {
    if (options.directory) {
      if (paths.length > 0) {
        log(chalk.red("Error: Can't use deprecated --directory option when specifying paths"));
        process.exit(1);
      }
      if (options.recursive) {
        log(chalk.red("Error: Can't use deprecated --directory option together with --recursive"));
        process.exit(1);
      }
      log(
        chalk.yellow(
          'Warning: deprecated option --directory used, this will be removed in a future release. Please specify paths with --recursive instead',
        ),
      );
      paths.push(options.directory);
      options.recursive = true;
    } else {
      if (paths.length === 0) {
        // If no path argument is given, check if an env variable is set
        const envPath = process.env.IMMICH_ASSET_PATH;
        if (!envPath) {
          log(chalk.red('Error: Must specify at least one path'));
          process.exit(1);
        } else {
          paths = [envPath];
        }
      }
    }
    upload(paths, options);
  });
