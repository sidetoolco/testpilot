/*
  # Email Templates Update
  
  1. Changes
    - Adds custom email templates for auth flows
    - Updates confirmation email template with TestPilot branding
    - Improves email messaging and layout
    
  2. Templates
    - Email confirmation template
    - Password reset template
    - Magic link template
    - Invite template
*/

-- Create email templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type TEXT UNIQUE NOT NULL,
  template TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert or update confirmation template
INSERT INTO auth.email_templates (template_type, template)
VALUES (
  'confirm_signup',
  '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Confirm Your TestPilot Email</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="https://i.imghippo.com/files/QfED5977I.png" alt="TestPilot" style="height: 48px;">
        </div>
        
        <h1 style="color: #1B1B1B; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Welcome to TestPilot! 🎉</h1>
        
        <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
          Thanks for signing up! Please confirm your email address to get started with TestPilot.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #00A67E; color: white; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 500;">
            Confirm Email
          </a>
        </div>

        <p style="color: #6B7280; font-size: 14px; text-align: center; margin: 24px 0 0;">
          If you did not create an account with TestPilot, you can safely ignore this email.
        </p>
      </div>
    </div>
  </body>
</html>'
) ON CONFLICT (template_type) DO UPDATE SET template = EXCLUDED.template;

-- Enable RLS
ALTER TABLE auth.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for auth templates
CREATE POLICY "Enable read access for authenticated users" ON auth.email_templates
  FOR SELECT TO authenticated USING (true);