export async function sendMail(to: string, subject: string, html: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.MAIL_FROM || user;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || 'true') === 'true';

  if (!host || !user || !pass || !from) {
    console.log('SMTP no configurado. Email omitido:', { to, subject });
    return false;
  }

  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  await transporter.sendMail({ from: `Gema Estudio de Belleza <${from}>`, to, subject, html });
  return true;
}
