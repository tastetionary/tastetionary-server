import { uploadFileToS3 } from './aws';

xdescribe('uploadFileToS3', () => {
  it('should upload file to s3', async () => {
    const config = {
      apiKey: '',
      secretKey: '',
      bucketName: '',
    };

    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test file content'),
      size: 100,
      destination: '',
      filename: 'test.jpg',
      path: '/tmp/test.jpg',
      stream: null as any,
    };

    const result = await uploadFileToS3('test-folder', mockFile, config);

    expect(result).toHaveProperty('key');
    expect(result).toHaveProperty('s3Object');
    expect(result).toHaveProperty('contentType', 'image/jpeg');
  });
});
