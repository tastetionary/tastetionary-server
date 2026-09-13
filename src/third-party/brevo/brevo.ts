import axios from 'axios';
import { Logger } from '@nestjs/common';
import { summarizeHttpError } from '@common/logging/redact';

const logger = new Logger('Brevo');

const BREVO_SEND_EMAIL_URL = 'https://api.brevo.com/v3/smtp/email';

interface BrevoConfig {
  apiKey: string;
  sender: { email: string; name: string };
  replyTo?: { email: string; name: string };
}

interface BrevoContent {
  subject: string;
  htmlContent: string;
  to: { email: string; name?: string }[];
}

function getDefaultConfig(): BrevoConfig {
  return {
    apiKey: '',
    sender: { email: 'no-reply@tastetionary.com', name: '맛셔너리팀' },
  };
}

export async function sendEmail(content: BrevoContent, config?: BrevoConfig) {
  config = config ?? getDefaultConfig();

  return axios
    .post(
      BREVO_SEND_EMAIL_URL,
      {
        subject: content.subject,
        htmlContent: content.htmlContent,
        sender: config.sender,
        to: content.to,
      },
      {
        headers: {
          'api-key': config.apiKey,
          'content-type': 'application/json',
          accept: 'application/json',
        },
      },
    )
    .then(
      function () {
        logger.log({ message: 'email sent', subject: content.subject });
        return true;
      },
      function (error) {
        logger.error({
          message: 'failed to send email',
          subject: content.subject,
          ...summarizeHttpError(error),
        });
        return false;
      },
    );
}
