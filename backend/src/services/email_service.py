import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from pydantic import EmailStr
from fastapi import HTTPException, status
import logging

from ..config.settings import settings


logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def send_email(to_email: EmailStr, subject: str, body: str, html_body: Optional[str] = None):
        """
        Send an email using SMTP
        """
        if not settings.EMAIL_HOST:
            logger.warning("Email host not configured, skipping email sending")
            return

        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = settings.EMAIL_FROM
            msg['To'] = to_email
            msg['Subject'] = subject

            # Add body to email
            if html_body:
                msg.attach(MIMEText(body, 'plain'))
                msg.attach(MIMEText(html_body, 'html'))
            else:
                msg.attach(MIMEText(body, 'plain'))

            # Create SMTP session
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
            server.starttls()  # Enable security
            server.login(settings.EMAIL_USERNAME, settings.EMAIL_PASSWORD)

            # Send email
            text = msg.as_string()
            server.sendmail(settings.EMAIL_FROM, to_email, text)
            server.quit()

            logger.info(f"Email sent successfully to {to_email}")

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send email"
            )

    @staticmethod
    def send_confirmation_email(to_email: EmailStr, username: str, confirmation_token: str):
        """
        Send account confirmation email
        """
        subject = "Confirm Your Account - Five Phase Hackathon Platform"

        body = f"""
        Hello {username},

        Thank you for registering with the Five Phase Hackathon Platform!

        Please click the link below to confirm your email address:
        {settings.FRONTEND_URL}/confirm-email?token={confirmation_token}

        If you did not create an account, please ignore this email.

        Best regards,
        The Five Phase Hackathon Team
        """

        html_body = f"""
        <html>
        <body>
            <h2>Welcome to Five Phase Hackathon Platform!</h2>
            <p>Hello {username},</p>
            <p>Thank you for registering with the Five Phase Hackathon Platform!</p>
            <p>Please click the button below to confirm your email address:</p>
            <a href="{settings.FRONTEND_URL}/confirm-email?token={confirmation_token}"
               style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
               Confirm Email Address
            </a>
            <p>If you did not create an account, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The Five Phase Hackathon Team</p>
        </body>
        </html>
        """

        EmailService.send_email(to_email, subject, body, html_body)

    @staticmethod
    def send_welcome_email(to_email: EmailStr, username: str):
        """
        Send welcome email after account confirmation
        """
        subject = "Welcome to Five Phase Hackathon Platform!"

        body = f"""
        Hello {username},

        Welcome to the Five Phase Hackathon Platform! Your account has been confirmed.

        You can now:
        - Join hackathons
        - Create or join teams
        - Submit projects
        - Participate in judging

        Start by visiting your dashboard: {settings.FRONTEND_URL}/dashboard

        Best regards,
        The Five Phase Hackathon Team
        """

        html_body = f"""
        <html>
        <body>
            <h2>Welcome to Five Phase Hackathon Platform!</h2>
            <p>Hello {username},</p>
            <p>Welcome to the Five Phase Hackathon Platform! Your account has been confirmed.</p>
            <p>You can now:</p>
            <ul>
                <li>Join hackathons</li>
                <li>Create or join teams</li>
                <li>Submit projects</li>
                <li>Participate in judging</li>
            </ul>
            <a href="{settings.FRONTEND_URL}/dashboard"
               style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
               Visit Dashboard
            </a>
            <br><br>
            <p>Best regards,<br>The Five Phase Hackathon Team</p>
        </body>
        </html>
        """

        EmailService.send_email(to_email, subject, body, html_body)

    @staticmethod
    def send_verification_code_email(to_email: EmailStr, username: str, verification_code: str):
        """
        Send verification code email for registration
        """
        subject = "Verify Your Email Address - Five Phase Hackathon Platform"

        body = f"""
        Hello {username},

        Thank you for registering with the Five Phase Hackathon Platform!

        Your verification code is: {verification_code}

        Please enter this code in the app to verify your email address and complete registration.

        The code will expire in 10 minutes.

        If you did not create an account, please ignore this email.

        Best regards,
        The Five Phase Hackathon Team
        """

        html_body = f"""
        <html>
        <body>
            <h2>Verify Your Email Address</h2>
            <p>Hello {username},</p>
            <p>Thank you for registering with the Five Phase Hackathon Platform!</p>
            <p>Your verification code is:</p>
            <div style="font-size: 24px; font-weight: bold; margin: 20px 0; padding: 10px; background-color: #f3f4f6; text-align: center; border-radius: 5px;">
                {verification_code}
            </div>
            <p>Please enter this code in the app to verify your email address and complete registration.</p>
            <p><strong>The code will expire in 10 minutes.</strong></p>
            <p>If you did not create an account, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The Five Phase Hackathon Team</p>
        </body>
        </html>
        """

        EmailService.send_email(to_email, subject, body, html_body)

    @staticmethod
    def send_login_verification_code_email(to_email: EmailStr, username: str, verification_code: str):
        """
        Send verification code email for login
        """
        subject = "Login Verification Code - Five Phase Hackathon Platform"

        body = f"""
        Hello {username},

        You have requested to log in to the Five Phase Hackathon Platform.

        Your verification code is: {verification_code}

        Please enter this code in the app to complete the login process.

        The code will expire in 10 minutes.

        If you did not request to log in, please ignore this email.

        Best regards,
        The Five Phase Hackathon Team
        """

        html_body = f"""
        <html>
        <body>
            <h2>Login Verification</h2>
            <p>Hello {username},</p>
            <p>You have requested to log in to the Five Phase Hackathon Platform.</p>
            <p>Your verification code is:</p>
            <div style="font-size: 24px; font-weight: bold; margin: 20px 0; padding: 10px; background-color: #f3f4f6; text-align: center; border-radius: 5px;">
                {verification_code}
            </div>
            <p>Please enter this code in the app to complete the login process.</p>
            <p><strong>The code will expire in 10 minutes.</strong></p>
            <p>If you did not request to log in, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The Five Phase Hackathon Team</p>
        </body>
        </html>
        """

        EmailService.send_email(to_email, subject, body, html_body)

    @staticmethod
    def send_password_reset_email(to_email: EmailStr, username: str, reset_token: str):
        """
        Send password reset email
        """
        subject = "Reset Your Password - Five Phase Hackathon Platform"

        body = f"""
        Hello {username},

        You have requested to reset your password for the Five Phase Hackathon Platform.

        Click the link below to reset your password:
        {settings.FRONTEND_URL}/reset-password?token={reset_token}

        If you did not request this, please ignore this email.

        Best regards,
        The Five Phase Hackathon Team
        """

        html_body = f"""
        <html>
        <body>
            <h2>Reset Your Password</h2>
            <p>Hello {username},</p>
            <p>You have requested to reset your password for the Five Phase Hackathon Platform.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{settings.FRONTEND_URL}/reset-password?token={reset_token}"
               style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">
               Reset Password
            </a>
            <p>If you did not request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>The Five Phase Hackathon Team</p>
        </body>
        </html>
        """

        EmailService.send_email(to_email, subject, body, html_body)