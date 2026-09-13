import * as SibApiV3Sdk from '@sendinblue/client';
import { Logger } from '@nestjs/common';
import { summarizeHttpError } from '@common/logging/redact';

const logger = new Logger('Brevo');

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
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(0, config.apiKey);

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = content.subject;
  sendSmtpEmail.htmlContent = content.htmlContent;
  sendSmtpEmail.sender = config.sender;
  sendSmtpEmail.to = content.to;

  return apiInstance.sendTransacEmail(sendSmtpEmail).then(
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
