import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function buildTempPasswordEmail(toName: string, tempPassword: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#FAF4E6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF4E6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#C49A3C,#8B6914);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:1px;">NAGAS Resort &amp; Spa</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Temporary Password</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;">
              <p style="margin:0 0 12px;color:#3D2B1F;font-size:15px;line-height:1.7;">Hello ${toName},</p>
              <p style="margin:0 0 12px;color:#3D2B1F;font-size:15px;line-height:1.7;">
                A password reset was requested for your admin dashboard account. Use the temporary
                password below to sign in. You will be asked to set a new password after signing in.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0;text-align:center;">
              <div style="background-color:#FFF4E0;border:2px solid #C49A3C;border-radius:12px;padding:20px 24px;display:inline-block;">
                <p style="margin:0 0 6px;color:#8B6914;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Temporary Password</p>
                <p style="margin:0;color:#1B2A4A;font-size:24px;font-weight:700;letter-spacing:2px;">${tempPassword}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0;color:#3D2B1F;font-size:14px;line-height:1.7;">
                This temporary password is valid for <strong>15 minutes</strong> and can only be used
                once. If you did not request this, please ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 32px;text-align:center;">
              <hr style="border:none;border-top:1px solid #E8E0D0;margin-bottom:20px;" />
              <p style="margin:0;color:#8B6914;font-size:11px;letter-spacing:1px;text-transform:uppercase;">NAGAS Resort &amp; Spa</p>
              <p style="margin:6px 0 0;color:#3D2B1F;font-size:12px;">Admin Dashboard</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendTempPasswordEmail(toEmail: string, toName: string, tempPassword: string) {
  return transporter.sendMail({
    from: `"NAGAS Resort Admin" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: '[NAGAS Resort] Your temporary admin password',
    html: buildTempPasswordEmail(toName, tempPassword),
  });
}
