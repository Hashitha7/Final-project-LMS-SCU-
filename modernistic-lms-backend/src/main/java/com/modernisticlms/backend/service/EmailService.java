package com.modernisticlms.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.institute.email:}")
    private String instituteEmail;

    private boolean isMailConfigured() {
        return mailSender != null
                && fromEmail != null
                && !fromEmail.isBlank()
                && !fromEmail.equals("YOUR_GMAIL@gmail.com");
    }

    /**
     * Send welcome credentials email to the newly added teacher.
     */
    @Async
    public void sendTeacherWelcomeEmail(String toEmail, String teacherName, String plainPassword) {
        if (!isMailConfigured()) {
            log.warn("📧 Email not configured. Skipping welcome email to: {}", toEmail);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Modernistic LMS");
            helper.setTo(toEmail);
            helper.setSubject("🎓 Welcome to Modernistic LMS – Your Account Details");

            String html = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8"/>
                      <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
                        .container { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 12px;
                                     overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
                        .header { background: linear-gradient(135deg, #1e293b 0%%, #334155 100%%);
                                  padding: 36px 40px; text-align: center; }
                        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
                        .header p { color: #94a3b8; margin: 8px 0 0; font-size: 14px; }
                        .body { padding: 36px 40px; }
                        .greeting { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px; }
                        .text { color: #475569; font-size: 14px; line-height: 1.7; margin-bottom: 24px; }
                        .credentials-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
                                           padding: 24px; margin-bottom: 24px; }
                        .credentials-box h3 { color: #1e293b; font-size: 15px; font-weight: 600; margin: 0 0 16px; }
                        .cred-row { display: flex; align-items: center; margin-bottom: 12px; }
                        .cred-label { color: #64748b; font-size: 13px; font-weight: 600; width: 90px; flex-shrink: 0; }
                        .cred-value { background: #e2e8f0; color: #1e293b; font-size: 14px; font-weight: 700;
                                      padding: 8px 14px; border-radius: 6px; font-family: 'Courier New', monospace; flex: 1; }
                        .btn { display: inline-block; background: linear-gradient(135deg, #1e293b, #334155);
                               color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px;
                               font-size: 15px; font-weight: 600; margin-bottom: 24px; }
                        .warning { background: #fef9c3; border-left: 4px solid #eab308; padding: 14px 18px;
                                   border-radius: 0 8px 8px 0; color: #854d0e; font-size: 13px; line-height: 1.6; }
                        .footer { background: #f8fafc; padding: 20px 40px; text-align: center;
                                  color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <h1>🎓 Modernistic LMS</h1>
                          <p>Your Teacher Account is Ready</p>
                        </div>
                        <div class="body">
                          <p class="greeting">Hello, %s! 👋</p>
                          <p class="text">Your teacher account has been successfully created on <strong>Modernistic LMS</strong>.
                          You can now log in and start managing your classes, students, and lessons.</p>

                          <div class="credentials-box">
                            <h3>🔑 Your Login Credentials</h3>
                            <div class="cred-row">
                              <span class="cred-label">📧 Email</span>
                              <span class="cred-value">%s</span>
                            </div>
                            <div class="cred-row">
                              <span class="cred-label">🔒 Password</span>
                              <span class="cred-value">%s</span>
                            </div>
                          </div>

                          <p style="text-align:center; margin-bottom: 24px;">
                            <a class="btn" href="http://localhost:5173/login">Login to Modernistic LMS →</a>
                          </p>

                          <div class="warning">
                            ⚠️ <strong>Security Notice:</strong> Please change your password immediately after your first login.
                            Do not share your credentials with anyone.
                          </div>
                        </div>
                        <div class="footer">
                          © 2025 Modernistic LMS · This is an automated message, please do not reply.
                        </div>
                      </div>
                    </body>
                    </html>
                    """
                    .formatted(teacherName, toEmail, plainPassword);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("✅ Welcome email sent to teacher: {}", toEmail);

        } catch (Exception e) {
            log.error("❌ Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        }
    }

    /**
     * Send notification email to the institute/admin that a new teacher was added.
     */
    @Async
    public void sendInstituteNotification(String instituteName, String teacherName, String teacherEmail,
            String teacherMobile) {
        if (!isMailConfigured()) {
            log.warn("📧 Email not configured. Skipping institute notification.");
            return;
        }

        String recipient = (instituteEmail != null && !instituteEmail.isBlank()
                && !instituteEmail.equals("YOUR_GMAIL@gmail.com"))
                        ? instituteEmail
                        : fromEmail; // fallback to sender email

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Modernistic LMS");
            helper.setTo(recipient);
            helper.setSubject("✅ New Teacher Added – " + teacherName);

            String html = """
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="UTF-8"/>
                      <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; margin: 0; padding: 0; }
                        .container { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 12px;
                                     overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
                        .header { background: linear-gradient(135deg, #065f46 0%%, #059669 100%%);
                                  padding: 36px 40px; text-align: center; }
                        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
                        .header p { color: #a7f3d0; margin: 8px 0 0; font-size: 14px; }
                        .body { padding: 36px 40px; }
                        .badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 13px;
                                 font-weight: 700; padding: 6px 14px; border-radius: 99px; margin-bottom: 20px; }
                        .text { color: #475569; font-size: 14px; line-height: 1.7; margin-bottom: 24px; }
                        .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
                                    padding: 24px; margin-bottom: 24px; }
                        .info-row { display: flex; margin-bottom: 10px; }
                        .info-label { color: #64748b; font-size: 13px; font-weight: 600; width: 90px; flex-shrink: 0; }
                        .info-value { color: #1e293b; font-size: 14px; font-weight: 500; }
                        .footer { background: #f8fafc; padding: 20px 40px; text-align: center;
                                  color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <h1>✅ New Teacher Added</h1>
                          <p>Modernistic LMS – Admin Notification</p>
                        </div>
                        <div class="body">
                          <span class="badge">✅ Teacher Added Successfully</span>
                          <p class="text">Hello <strong>%s</strong>,<br/>
                          A new teacher account has been successfully created in your LMS system.</p>

                          <div class="info-box">
                            <div class="info-row">
                              <span class="info-label">👤 Name</span>
                              <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                              <span class="info-label">📧 Email</span>
                              <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                              <span class="info-label">📱 Mobile</span>
                              <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                              <span class="info-label">🕐 Added At</span>
                              <span class="info-value">%s</span>
                            </div>
                          </div>

                          <p class="text">The teacher has been sent a welcome email with their login credentials.</p>
                        </div>
                        <div class="footer">
                          © 2025 Modernistic LMS · Admin Notification
                        </div>
                      </div>
                    </body>
                    </html>
                    """.formatted(
                    instituteName,
                    teacherName,
                    teacherEmail,
                    teacherMobile != null ? teacherMobile : "Not provided",
                    java.time.LocalDateTime.now()
                            .format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")));

            helper.setText(html, true);
            mailSender.send(message);
            log.info("✅ Institute notification sent to: {}", recipient);

        } catch (Exception e) {
            log.error("❌ Failed to send institute notification: {}", e.getMessage());
        }
    }
}
