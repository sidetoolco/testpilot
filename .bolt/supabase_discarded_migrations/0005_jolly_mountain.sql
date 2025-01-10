/*
  # Password Reset Email Template
  
  1. Changes
    - Updates the password reset email template
    - Adds TestPilot branding and styling
    - Improves email messaging and layout
*/

-- Update the password reset email template
UPDATE auth.templates 
SET template = '<!DOCTYPE html>
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
          We received a request to reset your password. Click the button below to choose a new password. If you did not make this request, you can safely ignore this email.
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
</html>'
WHERE template_type = 'recovery';