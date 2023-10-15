import * as SibApiV3Sdk from '@sendinblue/client';

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
    sender: { email: 'no-reply@tastetionary.com', name: '맛셔너러팀' },
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
