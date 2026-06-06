import nodemailer from "nodemailer";

console.log("EMAIL_USER", process.env.EMAIL_USER);
console.log("EMAIL_PASS", process.env.EMAIL_PASS);
export const sendEmail = async ({ to, subject, html }) => {
  // Moving this inside means it reads process.env at RUNTIME, not boot time!
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Hospital System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};