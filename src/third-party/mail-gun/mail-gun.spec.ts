import { sendEmail } from './mail-gun';

xdescribe('mail-gun, real', () => {
  it('should send email', async () => {
    const res = await sendEmail(
      {
        toEmail: '',
        subject: '제목입니다',
        content: '<h1>12345</h1>',
      },
      {
        apiKey: '',
        domain: '',
        fromEmail: 'who@taste.com',
        fromTitle: '보내는 사람 제목',
      },
    );
    expect(res).toBe(true);
  });
});
