import { promises as fs } from 'fs';
import { join, dirname, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface StorageObject {
  bucket: string;
  key: string;
  url: string;
}

export interface StorageMetadata {
  bucket: string;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  originalFilename?: string;
}

const STORAGE_ROOT = process.env.STORAGE_ROOT || '/srv/itekane-storage';
const STORAGE_PUBLIC_URL = process.env.STORAGE_PUBLIC_URL || 'https://itkane.net/media';
const STORAGE_SECRET = process.env.STORAGE_SECRET || '';
const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || '104857600', 10);

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
}

function ensureDirectoryExists(dirPath: string): Promise<void> {
  return fs.mkdir(dirPath, { recursive: true });
}

function getBucketPath(bucket: string): string {
  return join(STORAGE_ROOT, bucket);
}

function getObjectPath(bucket: string, key: string): string {
  return join(STORAGE_ROOT, bucket, key);
}

function generateKey(originalFilename: string, mimeType?: string): string {
  const ext = extname(originalFilename);
  const uuid = uuidv4();
  const sanitizedExt = sanitizeFilename(ext) || '.bin';
  
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}/${month}/${day}/${uuid}${sanitizedExt}`;
}

export async function uploadObject(
  bucket: string,
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<StorageObject> {
  if (buffer.length > MAX_UPLOAD_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_UPLOAD_SIZE} bytes`);
  }

  if (!STORAGE_SECRET) {
    throw new Error('STORAGE_SECRET is not configured');
  }

  const key = generateKey(originalFilename, mimeType);
  const objectPath = getObjectPath(bucket, key);
  const objectDir = dirname(objectPath);

  await ensureDirectoryExists(objectDir);
  await fs.writeFile(objectPath, buffer);

  const url = `${STORAGE_PUBLIC_URL}/${bucket}/${key}`;

  return {
    bucket,
    key,
    url,
  };
}

export async function deleteObject(bucket: string, key: string): Promise<void> {
  const objectPath = getObjectPath(bucket, key);
  
  try {
    await fs.unlink(objectPath);
    
    const dirPath = dirname(objectPath);
    try {
      const files = await fs.readdir(dirPath);
      if (files.length === 0) {
        await fs.rmdir(dirPath);
      }
    } catch {
    }
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function replaceObject(
  bucket: string,
  key: string,
  buffer: Buffer,
  mimeType: string
): Promise<StorageObject> {
  if (buffer.length > MAX_UPLOAD_SIZE) {
    throw new Error(`File size exceeds maximum allowed size of ${MAX_UPLOAD_SIZE} bytes`);
  }

  const objectPath = getObjectPath(bucket, key);
  const objectDir = dirname(objectPath);

  await ensureDirectoryExists(objectDir);
  await fs.writeFile(objectPath, buffer);

  const url = `${STORAGE_PUBLIC_URL}/${bucket}/${key}`;

  return {
    bucket,
    key,
    url,
  };
}

export async function objectExists(bucket: string, key: string): Promise<boolean> {
  const objectPath = getObjectPath(bucket, key);
  try {
    await fs.access(objectPath);
    return true;
  } catch {
    return false;
  }
}

export async function getObjectMetadata(bucket: string, key: string): Promise<{
  size: number;
  mimeType?: string;
  lastModified: Date;
}> {
  const objectPath = getObjectPath(bucket, key);
  const stats = await fs.stat(objectPath);
  
  return {
    size: stats.size,
    lastModified: stats.mtime,
  };
}

