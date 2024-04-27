import { sendDiscordMessage } from './discord';

xdescribe('sendDiscordMessage', () => {
  it('should send a message to discord', async () => {
    const config = {
      url: '',
    };

    const content = {
      title: 'test title',
      description: 'test description',
    };

    const res = await sendDiscordMessage(content, config);
    expect(res).toHaveBeenCalledWith(content, config);
    expect(res).toBeTruthy();
  });
});
