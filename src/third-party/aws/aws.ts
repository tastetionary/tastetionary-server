import { BadRequestException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';

interface AwsS3Config {
  apiKey: string;
  secretKey: string;
  bucketName: string;
  region?: string;
}

function getDefaultConfig(): AwsS3Config {
  return {
    apiKey: process.env.AWS_S3_ACCESS_KEY || '',
    secretKey: process.env.AWS_S3_SECRET_KEY || '',
    bucketName: process.env.AWS_S3_BUCKET_NAME || '',
    region: process.env.AWS_S3_REGION || 'ap-northeast-2',
  };
}

function createS3Client(configParam?: AwsS3Config): S3Client {
  const config = configParam ?? getDefaultConfig();
  return new S3Client({
    credentials: {
      accessKeyId: config.apiKey,
      secretAccessKey: config.secretKey,
    },
    region: config.region,
  });
}

export async function uploadFileToS3(
  key: string,
  file: Express.Multer.File,
  config?: AwsS3Config,
): Promise<{
  key: string;
  s3Object: PutObjectCommandOutput;
  contentType: string;
}> {
  const s3Client = createS3Client(config);
  const finalConfig = config ?? getDefaultConfig();

  try {
    const s3Object = await s3Client.send(
      new PutObjectCommand({
        Bucket: finalConfig.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return { key, s3Object, contentType: file.mimetype };
  } catch (error) {
    throw new BadRequestException(`File upload failed : ${error}`);
  }
}

export function getFileUrl(objectKey: string): string {
  return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${objectKey}`;
}
