import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || "";
const CONTAINER_NAME = "tree-inspection-images";

class BlobStorageService {
  private containerClient: ContainerClient;

  constructor() {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    this.containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  }

  async uploadImage(imageData: string, fileName: string): Promise<string> {
    await this.containerClient.createIfNotExists();
    const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
    
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    await blockBlobClient.upload(buffer, buffer.length);
    
    return blockBlobClient.url;
  }

  async deleteImage(fileName: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(fileName);
    await blockBlobClient.delete();
  }
}

export const blobStorageService = new BlobStorageService();

