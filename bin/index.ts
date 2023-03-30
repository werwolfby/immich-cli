#! /usr/bin/env node
import axios, { AxiosRequestConfig } from "axios";
import { program, Option } from "commander";
import * as fs from "fs";
import { fdir, PathsOutput } from "fdir";
import * as si from "systeminformation";
import * as readline from "readline";
import * as path from "path";
import FormData from "form-data";
import * as cliProgress from "cli-progress";
import { stat } from "fs/promises";
import { createHash } from "crypto";

// GLOBAL
import * as mime from "mime-types";
import chalk from "chalk";
import pjson from "../package.json";
import pLimit from "p-limit";

const log = console.log;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
let errorAssets: any[] = [];

const SUPPORTED_MIME_TYPES = [
  // IMAGES
  "image/heif",
  "image/heic",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/dng",
  "image/x-adobe-dng",
  "image/webp",
  "image/tiff",
  "image/nef",
  "image/x-nikon-nef",

  // VIDEO
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/3gpp",
];

program
  .name("immich")
  .description("Immich command line interface")
  .version(pjson.version);

program
  .command("upload")
  .description("Upload assets to an Immich instance")
  .usage("upload [options] <paths...>")
  .addOption(new Option("-k, --key <value>", "API Key").env("IMMICH_API_KEY"))
  .addOption(
    new Option(
      "-s, --server <value>",
      "Immich server address (http://<your-ip>:2283/api or https://<your-domain>/api)"
    ).env("IMMICH_SERVER_ADDRESS")
  )
  .addOption(
    new Option("-r, --recursive", "Recursive")
      .env("IMMICH_RECURSIVE")
      .default(false)
  )
  .addOption(
    new Option("-y, --yes", "Assume yes on all interactive prompts").env(
      "IMMICH_ASSUME_YES"
    )
  )
  .addOption(
    new Option("-da, --delete", "Delete local assets after upload").env(
      "IMMICH_DELETE_ASSETS"
    )
  )
  .addOption(
    new Option(
      "-t, --threads",
      "Amount of concurrent upload threads (default=5)"
    ).env("IMMICH_UPLOAD_THREADS")
  )
  .addOption(
    new Option(
      "-al, --album [album]",
      "Create albums for assets based on the parent folder or a given name"
    ).env("IMMICH_CREATE_ALBUMS")
  )
  .addOption(
    new Option(
      "-h, --skip-hash",
      "Skip hashing. Faster scan but requires more bandwidth and delegates deduplication to the server"
    ).env("IMMICH-SKIP-HASH")
  )
  .addOption(
    new Option(
      "-d, --directory <value>",
      "Upload assets recurisvely from the specified directory (DEPRECATED, use path argument with --recursive instead)"
    ).env("IMMICH_TARGET_DIRECTORY")
  )
  .argument("[paths...]", "One or more paths to assets to be uploaded")
  .action((paths, options) => {
    if (options.directory) {
      if (paths.length > 0) {
        log(
          chalk.red(
            "Error: Can't use deprecated --directory option when specifying paths"
          )
        );
        process.exit(1);
      }
      if (options.recursive) {
        log(
          chalk.red(
            "Error: Can't use deprecated --directory option together with --recursive"
          )
        );
        process.exit(1);
      }
      log(
        chalk.yellow(
          "Warning: deprecated option --directory used, this will be removed in a future release. Please specify paths with --recursive instead"
        )
      );
      paths.push(options.directory);
      options.recursive = true;
    } else {
      if (paths.length === 0) {
        // If no path argument is given, check if an env variable is set
        const envPath = process.env.IMMICH_ASSET_PATH;
        if (!envPath) {
          log(chalk.red("Error: Must specify at least one path"));
          process.exit(1);
        } else {
          paths = [envPath];
        }
      }
    }
    upload(paths, options);
  });

program.parse(process.argv);

async function upload(
  paths: string[],
  {
    key,
    server,
    recursive,
    yes: assumeYes,
    delete: deleteAssets,
    uploadThreads,
    album: createAlbums,
    skipHash,
  }: any
) {
  const endpoint = server;

  // Ping server
  log("Checking connectivity with Immich instance...");
  await pingServer(endpoint);

  // Login
  log("Checking credentials...");
  const user = await validateConnection(endpoint, key);
  log(chalk.green(`Successful authentication for user ${user.email}`));

  // Index provided directory
  log("Indexing local assets...");

  let crawler = new fdir().withFullPaths();

  if (!recursive) {
    // Don't go into subfolders
    crawler = crawler.withMaxDepth(0);
  }

  const files: any[] = [];

  for (const newPath of paths) {
    try {
      // Check if the path can be accessed
      await fs.promises.access(newPath);
    } catch (e) {
      log(chalk.red(e));
      process.exit(1);
    }

    const stats = await fs.promises.lstat(newPath);

    if (stats.isDirectory()) {
      // Path is a directory so use the crawler to crawl it
      files.push(
        ...((await crawler.crawl(newPath).withPromise()) as PathsOutput)
      );
    } else {
      // Path is a single file
      files.push(path.resolve(newPath));
    }
  }

  // Ensure that list of paths only has unique entries
  const uniquePaths = new Set(files);

  if (uniquePaths.size == 0) {
    log("No local assets found, exiting");
    process.exit(0);
  }

  log(`Indexing complete, found ${uniquePaths.size} local assets`);

  const localAssets: any[] = [];
  const assetsToCheck: CheckAssetExistenceDto[] = [];

  if (skipHash) {
    log("Checking local assets...");
  } else {
    log("Hashing local assets...");
  }

  let hashCounter = 0;

  const crypto = require("crypto");

  const sha1 = (filePath: string) =>
    new Promise<string>((resolve, reject) => {
      const hash = crypto.createHash("sha1");
      const rs = fs.createReadStream(filePath);
      rs.on("error", reject);
      rs.on("data", (chunk) => hash.update(chunk));
      rs.on("end", () => resolve(hash.digest("hex")));
    });

  for (const assetPath of uniquePaths) {
    const mimeType = mime.lookup(assetPath) as string;
    if (SUPPORTED_MIME_TYPES.includes(mimeType)) {
      if (!skipHash) {
        hashCounter++;
        if (hashCounter % 10 == 0 || hashCounter == uniquePaths.size) {
          log(hashCounter + " of " + uniquePaths.size);
        }
        const checksum: string = await sha1(assetPath);
        localAssets.push({
          path: assetPath,
          checksum: checksum,
        });
      } else {
        localAssets.push({ path: assetPath, toUpload: true });
      }
    }
  }

  if (localAssets.length == 0) {
    log("No supported assets found, exiting");
    process.exit(0);
  }

  log(`Found ${localAssets.length} supported assets`);

  let checkedAssets: CheckedAssetDto[];

  if (skipHash) {
    checkedAssets = localAssets;
  } else {
    log("Checking which assets to upload...");
    checkedAssets = await checkIfAssetsExist(endpoint, key, localAssets);
  }

  const numberOfUploads: number = checkedAssets.filter(
    (asset) => asset.toUpload
  ).length;

  if (numberOfUploads == 0 && !createAlbums) {
    log(chalk.green("All assets are already uploaded, exiting"));
    process.exit(0);
  } else if (numberOfUploads == 0 && createAlbums) {
    log(
      chalk.green(
        `All ${checkedAssets.length} are already uploaded, will add them to the album`
      )
    );
  } else if (numberOfUploads > 0 && createAlbums) {
    log(
      chalk.green(
        `Will upload ${numberOfUploads} assets to the server and add ${checkedAssets.length} to the album`
      )
    );
  } else if (numberOfUploads < checkedAssets.length) {
    log(
      chalk.green(
        `Found ${
          checkedAssets.length - numberOfUploads
        } assets already on server. Now uploading remaining ${numberOfUploads} assets...`
      )
    );
  } else {
    log(chalk.green(`Will upload ${numberOfUploads} assets...`));
  }

  // Ask user
  try {
    //There is a promise API for readline, but it's currently experimental
    //https://nodejs.org/api/readline.html#promises-api
    const answer = assumeYes
      ? "y"
      : await new Promise((resolve) => {
          rl.question("Upload? (y/n) ", resolve);
        });
    const deleteLocalAsset = deleteAssets ? "y" : "n";

    if (answer != "y") {
      log(chalk.yellow("Aborting..."));
      process.exit(1);
    }

    if (answer == "y") {
      log(chalk.green("Starting upload..."));
      const progressBar = new cliProgress.SingleBar(
        {
          format:
            "Upload Progress | {bar} | {percentage}% || {value}/{total} || Current file [{filepath}]",
        },
        cliProgress.Presets.shades_classic
      );
      progressBar.start(numberOfUploads, 0, { filepath: "" });

      const assetDirectoryMap: Map<string, string[]> = new Map();

      const uploadQueue = [];

      const limit = pLimit(uploadThreads ?? 5);

      for (const asset of checkedAssets) {
        const album = asset.path.split(path.sep).slice(-2)[0];
        if (!assetDirectoryMap.has(album)) {
          assetDirectoryMap.set(album, []);
        }

        if (asset.toUpload) {
          // New file, let's upload it!
          uploadQueue.push(
            limit(async () => {
              try {
                const res = await startUpload(endpoint, key, asset);
                progressBar.increment(1, { filepath: asset.path });
                if (res && (res.status == 201 || res.status == 200)) {
                  if (deleteLocalAsset == "y") {
                    fs.unlink(asset.path, (err) => {
                      if (err) {
                        log(err);
                        return;
                      }
                    });
                  }
                  assetDirectoryMap.get(album)!.push(res!.data.id);
                }
              } catch (err) {
                log(chalk.red(err.message));
              }
            })
          );
        } else if (createAlbums) {
          // Existing file. No need to upload it BUT lets still add to Album.
          uploadQueue.push(
            limit(async () => {
              try {
                assetDirectoryMap.get(album)!.push(asset.path);
              } catch (err) {
                log(chalk.red(err.message));
              }
            })
          );
        }
      }

      const uploads = await Promise.all(uploadQueue);

      progressBar.stop();

      if (createAlbums) {
        log(chalk.green("Creating albums..."));

        const serverAlbums = await getAlbumsFromServer(endpoint, key);

        if (typeof createAlbums === "boolean") {
          progressBar.start(assetDirectoryMap.size, 0);

          for (const localAlbum of assetDirectoryMap.keys()) {
            const serverAlbumIndex = serverAlbums.findIndex(
              (album: any) => album.albumName === localAlbum
            );
            let albumId: string;
            if (serverAlbumIndex > -1) {
              albumId = serverAlbums[serverAlbumIndex].id;
            } else {
              albumId = await createAlbum(endpoint, key, localAlbum);
            }

            if (albumId) {
              await addAssetsToAlbum(
                endpoint,
                key,
                albumId,
                assetDirectoryMap.get(localAlbum)!
              );
            }

            progressBar.increment();
          }

          progressBar.stop();
        } else {
          const serverAlbumIndex = serverAlbums.findIndex(
            (album: any) => album.albumName === createAlbums
          );
          let albumId: string;

          if (serverAlbumIndex > -1) {
            albumId = serverAlbums[serverAlbumIndex].id;
          } else {
            albumId = await createAlbum(endpoint, key, createAlbums);
          }

          await addAssetsToAlbum(
            endpoint,
            key,
            albumId,
            Array.from(assetDirectoryMap.values()).flat()
          );
        }
      }

      log(chalk.yellow(`Failed to upload ${errorAssets.length} files `));
      for (const errorAsset of errorAssets) {
        log(
          errorAsset.file + ":",
          errorAsset.reason?.response?.status ?? errorAsset.reason,
          errorAsset.reason?.response?.statusText
        );
      }

      if (errorAssets.length > 0) {
        process.exit(1);
      }

      process.exit(0);
    }
  } catch (e) {
    log(chalk.red("Error reading input from user "), e);
    process.exit(1);
  }
}

async function startUpload(endpoint: string, key: string, asset: any) {
  try {
    const assetType = getAssetType(asset.path);
    const fileStat = await stat(asset.path);

    const data = new FormData();
    data.append("assetType", assetType);
    // This field is now deprecatd and we'll remove it from the API. Therefore, just set it to mtime for now
    data.append("fileCreatedAt", fileStat.ctime.toISOString());
    data.append("fileModifiedAt", fileStat.mtime.toISOString());
    data.append("isFavorite", JSON.stringify(false));
    data.append("fileExtension", path.basename(asset.path));
    data.append("duration", "0:00:00.000000");

    data.append("assetData", fs.createReadStream(asset.path));

    const config: AxiosRequestConfig<any> = {
      method: "post",
      maxRedirects: 0,
      url: `${endpoint}/asset/upload`,
      headers: {
        "x-api-key": key,
        ...data.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      data: data,
    };

    const res = await axios(config);
    return res;
  } catch (e) {
    errorAssets.push({
      file: asset.path,
      reason: e,
      response: e.response?.data,
    });
    return null;
  }
}

async function getAlbumsFromServer(endpoint: string, key: string) {
  try {
    const res = await axios.get(`${endpoint}/album`, {
      headers: { "x-api-key": key },
    });
    return res.data;
  } catch (e) {
    log(chalk.red("Error getting albums"), e);
    process.exit(1);
  }
}

async function createAlbum(endpoint: string, key: string, albumName: string) {
  try {
    const res = await axios.post(
      `${endpoint}/album`,
      { albumName },
      {
        headers: { "x-api-key": key },
      }
    );
    return res.data.id;
  } catch (e) {
    log(chalk.red(`Error creating album '${albumName}'`), e);
  }
}

async function addAssetsToAlbum(
  endpoint: string,
  key: string,
  albumId: string,
  assetIds: string[]
) {
  try {
    await axios.put(
      `${endpoint}/album/${albumId}/assets`,
      { assetIds: [...new Set(assetIds)] },
      {
        headers: { "x-api-key": key },
      }
    );
  } catch (e) {
    log(chalk.red("Error adding asset to album"), e);
  }
}

async function getAssetInfoFromServer(
  endpoint: string,
  key: string,
  deviceId: string
) {
  try {
    const res = await axios.get(`${endpoint}/asset/${deviceId}`, {
      headers: { "x-api-key": key },
    });
    return res.data;
  } catch (e) {
    log(chalk.red("Error getting device's uploaded assets"), e);
    process.exit(1);
  }
}

async function checkIfAssetsExist(
  endpoint: string,
  key: string,
  checkAssetExistenceDto: CheckAssetExistenceDto[]
): Promise<CheckedAssetDto[]> {
  const data = JSON.stringify({
    assets: checkAssetExistenceDto.map((asset) => ({
      id: asset.path,
      checksum: asset.checksum,
    })),
  });
  try {
    const res = await axios.post(`${endpoint}/asset/bulk-upload-check`, data, {
      headers: { "x-api-key": key, "Content-Type": "application/json" },
    });
    const checkedAssetResponseDto: CheckedAssetResponseDto[] = res.data.results;
    return checkedAssetResponseDto.map((asset) => ({
      path: asset.id,
      toUpload: asset.action === "accept",
    }));
  } catch (e) {
    log(chalk.red("Error checking assets on server"), e.message);
    process.exit(1);
  }
}

async function pingServer(endpoint: string) {
  try {
    const res = await axios.get(`${endpoint}/server-info/ping`);
    if (res.data["res"] == "pong") {
      log(chalk.green("Server status: OK"));
    }
  } catch (e) {
    log(
      chalk.red("Error connecting to server - check server address and port"),
      e.message
    );
    process.exit(1);
  }
}

async function validateConnection(endpoint: string, key: string) {
  try {
    const res = await axios.get(`${endpoint}/user/me`, {
      headers: { "x-api-key": key },
    });

    if (res.status == 200) {
      log(chalk.green("Login status: OK"));
      return res.data;
    }
  } catch (e) {
    log(chalk.red("Error logging in - check api key"), e.message);
    process.exit(1);
  }
}

function getAssetType(filePath: string) {
  const mimeType = mime.lookup(filePath) as string;

  return mimeType.split("/")[0].toUpperCase();
}

class CheckAssetExistenceDto {
  path!: string;
  checksum!: string;
}

class CheckedAssetDto {
  path!: string;
  toUpload!: boolean;
}

class CheckedAssetResponseDto {
  id!: string;
  action!: string;
  reason!: string;
}
