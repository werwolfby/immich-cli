import {
  AlbumApi,
  APIKeyApi,
  AssetApi,
  AuthenticationApi,
  Configuration,
  JobApi,
  OAuthApi,
  ServerInfoApi,
  ShareApi,
  SystemConfigApi,
  UserApi,
} from 'immich-sdk';

export class ImmichApi {
  public userApi: UserApi;
  public albumApi: AlbumApi;
  public assetApi: AssetApi;
  public authenticationApi: AuthenticationApi;
  public oauthApi: OAuthApi;
  public serverInfoApi: ServerInfoApi;
  public jobApi: JobApi;
  public keyApi: APIKeyApi;
  public systemConfigApi: SystemConfigApi;
  public shareApi: ShareApi;

  public serverUrl: string;
  public key: string;

  private config;

  constructor(address: URL, apiKey: string) {
    this.serverUrl = address.toString();
    this.key = apiKey;

    this.config = new Configuration({
      basePath: address.toString(),
      baseOptions: {
        headers: {
          'x-api-key': apiKey,
        },
      },
    });

    this.userApi = new UserApi(this.config);
    this.albumApi = new AlbumApi(this.config);
    this.assetApi = new AssetApi(this.config);
    this.authenticationApi = new AuthenticationApi(this.config);
    this.oauthApi = new OAuthApi(this.config);
    this.serverInfoApi = new ServerInfoApi(this.config);
    this.jobApi = new JobApi(this.config);
    this.keyApi = new APIKeyApi(this.config);
    this.systemConfigApi = new SystemConfigApi(this.config);
    this.shareApi = new ShareApi(this.config);
  }
}
