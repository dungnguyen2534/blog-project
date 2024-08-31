import { createTransport } from "nodemailer";
import env from "../env";

const transporter = createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "7967fc001@smtp-brevo.com",
    pass: env.SMTP_PASSWORD,
  },
});

export default async function sendVerificationCode(email: string, otp: string) {
  await transporter.sendMail({
    from: "ndunv2503@gmail.com",
    to: email,
    subject: "Your verification code",
    html: `<p>This is your verification code. It will expire in 10 minutes</p><strong>${otp}</strong>
    `,
  });
}
