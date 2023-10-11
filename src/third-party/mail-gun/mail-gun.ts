import { NodeMailgun } from 'ts-mailgun';

interface MailGunConfig {
  apiKey: string;
  domain: string;
  fromEmail: string;
  fromTitle: string;
}

interface MailContents {
  toEmail: string;
  subject: string;
  content: string;
}

function getDefaultConfig(): MailGunConfig {
  // TODO: get from env
  return {
    apiKey: '',
    domain: '',
    fromEmail: '',
    fromTitle: '',
  };
}

function initMailGun(config: MailGunConfig) {
  const mailer = new NodeMailgun();
  mailer.apiKey = config.apiKey; // Set your API key
  mailer.domain = config.domain; // Set the domain you registered earlier
  mailer.fromEmail = config.fromEmail; // Set your from email
  mailer.fromTitle = config.fromTitle; // Set the name you would like to send from
  mailer.init();
  return mailer;
}

export function sendEmail(contents: MailContents, config?: MailGunConfig) {
  const mailer = initMailGun(config ?? getDefaultConfig());
  return mailer
    .send(contents.toEmail, contents.subject, contents.content)
    .then((result) => {
      console.log('Done', result);
      return true;
    })
    .catch((error) => {
      console.error('Error: ', error);
      return false;
    });
}
