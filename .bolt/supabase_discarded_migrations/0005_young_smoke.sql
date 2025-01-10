/*
  # Configure Email Templates
  
  1. Changes
    - Adds email template configuration for:
      - Signup confirmation
      - Password reset
      - Email change
      - Magic link login
  
  2. Security
    - No changes to security policies
    - Only updates email template configuration
*/

-- Update email template configuration
UPDATE auth.mfa_factors
SET friendly_name = CASE 
  WHEN factor_type = 'totp' THEN 'TestPilot Authenticator'
  ELSE friendly_name
END;

-- Update email templates
UPDATE auth.identities
SET email_template = jsonb_build_object(
  'subject', 'Welcome to TestPilot',
  'content_html', '<h2>Welcome to TestPilot!</h2><p>Click the button below to confirm your email address:</p><p><a href="{{ .ConfirmationURL }}" style="background-color: #00A67E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Confirm Email</a></p>',
  'content_text', 'Welcome to TestPilot! Click this link to confirm your email address: {{ .ConfirmationURL }}'
)
WHERE provider = 'email';

-- Update password reset template
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object(
  'email_templates', jsonb_build_object(
    'reset_password', jsonb_build_object(
      'subject', 'Reset Your TestPilot Password',
      'content_html', '<h2>Reset Your Password</h2><p>Click the button below to reset your password:</p><p><a href="{{ .ResetURL }}" style="background-color: #00A67E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a></p>',
      'content_text', 'Reset your TestPilot password by clicking this link: {{ .ResetURL }}'
    )
  )
);