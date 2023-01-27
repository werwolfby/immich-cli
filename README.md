oclif-hello-world
=================

# TODO:
* Implement commands
* Clean up generator boilerplate
* Fix README
* Fixup workflows


oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g immich
$ immich COMMAND
running command...
$ immich (--version)
immich/0.0.0 darwin-x64 node-v19.3.0
$ immich --help [COMMAND]
USAGE
  $ immich COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`immich hello PERSON`](#immich-hello-person)
* [`immich hello world`](#immich-hello-world)
* [`immich help [COMMANDS]`](#immich-help-commands)
* [`immich plugins`](#immich-plugins)
* [`immich plugins:install PLUGIN...`](#immich-pluginsinstall-plugin)
* [`immich plugins:inspect PLUGIN...`](#immich-pluginsinspect-plugin)
* [`immich plugins:install PLUGIN...`](#immich-pluginsinstall-plugin-1)
* [`immich plugins:link PLUGIN`](#immich-pluginslink-plugin)
* [`immich plugins:uninstall PLUGIN...`](#immich-pluginsuninstall-plugin)
* [`immich plugins:uninstall PLUGIN...`](#immich-pluginsuninstall-plugin-1)
* [`immich plugins:uninstall PLUGIN...`](#immich-pluginsuninstall-plugin-2)
* [`immich plugins update`](#immich-plugins-update)

## `immich hello PERSON`

Say hello

```
USAGE
  $ immich hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/immich-app/CLI/blob/v0.0.0/dist/commands/hello/index.ts)_

## `immich hello world`

Say hello world

```
USAGE
  $ immich hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ immich hello world
  hello world! (./src/commands/hello/world.ts)
```

## `immich help [COMMANDS]`

Display help for immich.

```
USAGE
  $ immich help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for immich.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.0/src/commands/help.ts)_

## `immich plugins`

List installed plugins.

```
USAGE
  $ immich plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ immich plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.2.2/src/commands/plugins/index.ts)_

## `immich plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ immich plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ immich plugins add

EXAMPLES
  $ immich plugins:install myplugin 

  $ immich plugins:install https://github.com/someuser/someplugin

  $ immich plugins:install someuser/someplugin
```

## `immich plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ immich plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ immich plugins:inspect myplugin
```

## `immich plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ immich plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ immich plugins add

EXAMPLES
  $ immich plugins:install myplugin 

  $ immich plugins:install https://github.com/someuser/someplugin

  $ immich plugins:install someuser/someplugin
```

## `immich plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ immich plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ immich plugins:link myplugin
```

## `immich plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ immich plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ immich plugins unlink
  $ immich plugins remove
```

## `immich plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ immich plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ immich plugins unlink
  $ immich plugins remove
```

## `immich plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ immich plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ immich plugins unlink
  $ immich plugins remove
```

## `immich plugins update`

Update installed plugins.

```
USAGE
  $ immich plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
