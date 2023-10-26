import { sendEmail } from './brevo';
import * as fs from 'fs';

xdescribe('test', () => {
  it('should send custom', async () => {
    const config = {
      apiKey: '',
      sender: { email: 'no-reply@tastetionary.com', name: '맛셔너리팀' },
    };

    let htmlContent = fs.readFileSync(
      'src/third-party/brevo/index.html',
      'utf8',
    );
    htmlContent = htmlContent.replace('{{verificationCode}}', '12345');
    const content = {
      subject: 'local test',
      htmlContent: htmlContent,
      to: [{ email: 'cth6809@gmail.com' }],
    };
    const res = await sendEmail(content, config);
    expect(res).toBeTruthy();
  });
});
