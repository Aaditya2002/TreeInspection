import { NextResponse } from 'next/server'
import { BlobServiceClient } from "@azure/storage-blob"

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING || ""
const CONTAINER_NAME = "tree-inspection-images"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING)
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME)
    
    await containerClient.createIfNotExists()
    const blockBlobClient = containerClient.getBlockBlobClient(file.name)
    
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    await blockBlobClient.upload(buffer, buffer.length)
    
    return NextResponse.json({ url: blockBlobClient.url })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

