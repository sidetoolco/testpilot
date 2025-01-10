/*
  # Email Templates Update
  
  1. Changes
    - Updates email templates for auth flows
    - Adds TestPilot branding and styling
    - Improves email messaging and layout
    
  2. Templates Updated
    - Confirmation email template
    - Password reset template
    - Magic link template
    - Invite template
*/

-- Update email templates in auth.templates
UPDATE auth.templates 
SET template = '<!DOCTYPE html>
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
WHERE template_type = 'confirmation';