import { Webhook, MessageBuilder } from 'discord-webhook-node';
import { Logger } from '@nestjs/common';
import { summarizeHttpError } from '@common/logging/redact';

const logger = new Logger('Discord');

interface DiscordConfig {
  webHookUrl: string;
}

interface DiscordContent {
  title: string;
  description: string;
}

function getDefaultConfig(): DiscordConfig {
  return {
    webHookUrl: '',
  };
}

export async function sendDiscordMessage(
  content: DiscordContent,
  config?: DiscordConfig,
) {
  config = config ?? getDefaultConfig();
  const webhook = new Webhook(config.webHookUrl);

  const embed = new MessageBuilder()
    .setTitle(content.title)
    .setDescription(content.description);
  return webhook.send(embed).then(
    function () {
      logger.log({ message: 'discord message sent', title: content.title });
      return true;
    },
    function (error) {
      logger.error({
        message: 'failed to send discord message',
        title: content.title,
        ...summarizeHttpError(error),
      });
      return false;
    },
  );
}
