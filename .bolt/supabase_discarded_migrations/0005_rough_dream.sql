/*
  # Configure Email Templates
  
  1. Changes
    - Updates email templates for:
      - Signup confirmation
      - Password reset
      - Email change
      - Magic link login
  
  2. Security
    - No changes to security policies
    - Only updates email template configuration
*/

-- Update email templates
UPDATE auth.templates
SET template = '{"subject": "Welcome to TestPilot! Confirm Your Email","content_html": "<h2>Welcome to TestPilot!</h2><p>Click the button below to confirm your email address:</p><p><a href=\"{{ .ConfirmationURL }}\" style=\"display: inline-block; color: white; background-color: #00A67E; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 24px 0px;\">Confirm Email</a></p><p>Or copy and paste this URL into your browser:</p><p>{{ .ConfirmationURL }}</p>","content_text": "Welcome to TestPilot!\n\nClick the link below to confirm your email address:\n\n{{ .ConfirmationURL }}"}'
WHERE template_type = 'confirmation';

UPDATE auth.templates
SET template = '{"subject": "Reset Your TestPilot Password","content_html": "<h2>Reset Your Password</h2><p>Click the button below to reset your password:</p><p><a href=\"{{ .ResetURL }}\" style=\"display: inline-block; color: white; background-color: #00A67E; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 24px 0px;\">Reset Password</a></p><p>Or copy and paste this URL into your browser:</p><p>{{ .ResetURL }}</p><p>If you did not request a password reset, please ignore this email.</p>","content_text": "Reset your TestPilot password by clicking this link:\n\n{{ .ResetURL }}\n\nIf you did not request a password reset, please ignore this email."}'
WHERE template_type = 'recovery';

UPDATE auth.templates
SET template = '{"subject": "Sign in to TestPilot","content_html": "<h2>Sign in to TestPilot</h2><p>Click the button below to sign in to your account:</p><p><a href=\"{{ .MagicLinkURL }}\" style=\"display: inline-block; color: white; background-color: #00A67E; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 24px 0px;\">Sign In</a></p><p>Or copy and paste this URL into your browser:</p><p>{{ .MagicLinkURL }}</p>","content_text": "Sign in to TestPilot by clicking this link:\n\n{{ .MagicLinkURL }}"}'
WHERE template_type = 'magic_link';

UPDATE auth.templates
SET template = '{"subject": "Verify Your New Email Address","content_html": "<h2>Verify Your New Email</h2><p>Click the button below to verify your new email address:</p><p><a href=\"{{ .ChangeEmailURL }}\" style=\"display: inline-block; color: white; background-color: #00A67E; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 24px 0px;\">Verify Email</a></p><p>Or copy and paste this URL into your browser:</p><p>{{ .ChangeEmailURL }}</p>","content_text": "Verify your new email address by clicking this link:\n\n{{ .ChangeEmailURL }}"}'
WHERE template_type = 'change_email';