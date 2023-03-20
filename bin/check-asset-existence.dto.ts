export class CheckAssetExistenceDto {
  constructor(id: string, checksum: string) {
    this.id = id;
    this.checksum = checksum;
  }
  id!: string;
  checksum!: string;
}
