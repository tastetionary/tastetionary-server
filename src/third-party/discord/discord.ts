import { Webhook, MessageBuilder } from 'discord-webhook-node';

interface DiscordConfig {
  url: string;
}

interface DiscordContent {
  title: string;
  description: string;
}

function getDefaultConfig(): DiscordConfig {
  return {
    url: '',
  };
}

export async function sendDiscordMessage(
  content: DiscordContent,
  config?: DiscordConfig,
) {
  config = config ?? getDefaultConfig();
  const webhook = new Webhook(config.url);

  const embed = new MessageBuilder()
    .setTitle(content.title)
    .setDescription(content.description);
  return webhook.send(embed).then(
    function (data) {
      console.log(
        'API called successfully. Returned data: ' + JSON.stringify(data),
      );
      return true;
    },
    function (error) {
      console.error(error);
      return false;
    },
  );
}
