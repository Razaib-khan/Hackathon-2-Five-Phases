import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from ..config.settings import settings
from ..utils.errors import EmailServiceException
import logging

# Set up logging
logger = logging.getLogger("aido_app")


class EmailService:
    def __init__(self):
        self.smtp_server = settings.smtp_server
        self.smtp_port = settings.smtp_port
        self.username = settings.smtp_username
        self.password = settings.smtp_password
        self.sender_email = settings.email_from

    def send_email(self, recipient_email: str, subject: str, body: str, html_body: Optional[str] = None):
        """
        Send an email to the specified recipient
        """
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = self.sender_email
            msg["To"] = recipient_email

            # Create text and HTML parts
            text_part = MIMEText(body, "plain")
            msg.attach(text_part)

            if html_body:
                html_part = MIMEText(html_body, "html")
                msg.attach(html_part)

            # Connect to server and send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Enable encryption
                server.login(self.username, self.password)
                server.sendmail(self.sender_email, recipient_email, msg.as_string())

            logger.info(f"Email sent successfully to {recipient_email}")
        except Exception as e:
            logger.error(f"Failed to send email to {recipient_email}: {str(e)}")
            raise EmailServiceException(f"Failed to send email: {str(e)}")

    def send_password_reset_email(self, recipient_email: str, reset_link: str):
        """
        Send a password reset email to the user
        """
        subject = "AIDO - Password Reset Request"
        body = f"""Hi there,

We received a request to reset your AIDO account password.

Click the link below to reset your password:
{reset_link}

The link will expire in 10 minutes for security reasons.

If you didn't request this, please ignore this email.

Best regards,
The AIDO Team"""

        html_body = f"""<html>
<body>
<p>Hi there,</p>

<p>We received a request to reset your AIDO account password.</p>

<p>Click the link below to reset your password:</p>
<p><a href="{reset_link}">Reset Password</a></p>

<p><em>The link will expire in 10 minutes for security reasons.</em></p>

<p>If you didn't request this, please ignore this email.</p>

<p>Best regards,<br>
The AIDO Team</p>
</body>
</html>"""

        self.send_email(recipient_email, subject, body, html_body)

    def send_welcome_email(self, recipient_email: str, first_name: str):
        """
        Send a welcome email to a new user
        """
        subject = "Welcome to AIDO!"
        body = f"""Hi {first_name},

Welcome to AIDO! We're excited to have you on board.

Get started by creating your first task and organizing your life.

Best regards,
The AIDO Team"""

        html_body = f"""<html>
<body>
<p>Hi {first_name},</p>

<p>Welcome to AIDO! We're excited to have you on board.</p>

<p>Get started by creating your first task and organizing your life.</p>

<p>Best regards,<br>
The AIDO Team</p>
</body>
</html>"""

        self.send_email(recipient_email, subject, body, html_body)


# Global instance of EmailService
email_service = EmailService()