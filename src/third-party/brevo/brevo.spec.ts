import { sendEmail } from './brevo';

xdescribe('test', () => {
  it('should send custom', async () => {
    const config = {
      apiKey: '',
      sender: { email: 'no-reply@tastetionary.com', name: '맛셔너러팀' },
    };
    const content = {
      subject: 'local test',
      htmlContent: '<h1>local test</h1>',
      to: [{ email: 'wkdgndldi@naver.com' }],
    };
    const res = await sendEmail(content, config);
    expect(res).toBeTruthy();
  });
});
