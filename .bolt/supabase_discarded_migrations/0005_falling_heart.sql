/*
  # Update Email Templates

  1. Changes
    - Updates email templates for auth flows with branded design
    - Adds TestPilot logo and styling
    - Improves email messaging and layout

  2. Templates Updated
    - Password Reset
    - Email Confirmation
    - Magic Link
    - Invite
*/

-- Create function to update email templates
CREATE OR REPLACE FUNCTION auth.update_email_templates()
RETURNS void AS $$
DECLARE
  template_data jsonb;
BEGIN
  template_data := jsonb_build_object(
    'recovery', '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Reset Your TestPilot Password</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="https://i.imghippo.com/files/QfED5977I.png" alt="TestPilot" style="height: 48px;">
        </div>
        
        <h1 style="color: #1B1B1B; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Reset Your Password</h1>
        
        <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
          We received a request to reset your password. Click the button below to choose a new password. If you didn''t make this request, you can safely ignore this email.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #00A67E; color: white; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 500;">
            Reset Password
          </a>
        </div>

        <p style="color: #6B7280; font-size: 14px; text-align: center; margin: 24px 0 0;">
          This link will expire in 24 hours.
        </p>
      </div>
    </div>
  </body>
</html>',

    'confirmation', '<!DOCTYPE html>
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
          If you didn''t create an account with TestPilot, you can safely ignore this email.
        </p>
      </div>
    </div>
  </body>
</html>',

    'invite', '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>You''re Invited to TestPilot</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="https://i.imghippo.com/files/QfED5977I.png" alt="TestPilot" style="height: 48px;">
        </div>
        
        <h1 style="color: #1B1B1B; font-size: 24px; font-weight: 600; margin: 0 0 16px;">You''re Invited! 🎉</h1>
        
        <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
          You''ve been invited to join TestPilot. Click the button below to accept your invitation and create your account.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #00A67E; color: white; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 500;">
            Accept Invitation
          </a>
        </div>

        <p style="color: #6B7280; font-size: 14px; text-align: center; margin: 24px 0 0;">
          This invitation will expire in 24 hours.
        </p>
      </div>
    </div>
  </body>
</html>',

    'magic_link', '<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Sign In to TestPilot</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="https://i.imghippo.com/files/QfED5977I.png" alt="TestPilot" style="height: 48px;">
        </div>
        
        <h1 style="color: #1B1B1B; font-size: 24px; font-weight: 600; margin: 0 0 16px;">Sign In to TestPilot</h1>
        
        <p style="color: #4B5563; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
          Click the button below to sign in to your TestPilot account. This link will expire in 24 hours.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #00A67E; color: white; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 500;">
            Sign In
          </a>
        </div>

        <p style="color: #6B7280; font-size: 14px; text-align: center; margin: 24px 0 0;">
          If you didn''t request this email, you can safely ignore it.
        </p>
      </div>
    </div>
  </body>
</html>'
  );

  -- Update the templates in auth.templates table
  INSERT INTO auth.templates (template_type, template)
  VALUES 
    ('recovery', template_data->>'recovery'),
    ('confirmation', template_data->>'confirmation'),
    ('invite', template_data->>'invite'),
    ('magic_link', template_data->>'magic_link')
  ON CONFLICT (template_type) 
  DO UPDATE SET template = EXCLUDED.template;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update templates
SELECT auth.update_email_templates();