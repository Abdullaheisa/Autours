Dear {{json_decode($body)->user->name}},<br>

We received a request to reset the password for your account associated with this email address: {{json_decode($body)->user->email}}.<br>

To reset your password, please click the link below:<br>

<a href="{{json_decode($body)->user->setNewPasswordLink}}">Reset Password</a><br>

If you didn’t request a password reset, please ignore this email, and your password will remain unchanged.<br>

For security reasons, this link will expire in 10 hours. If you need further assistance, feel free to contact our support team.<br>

Thank you for using our services!<br>

Best regards,<br>

Autours,<br>
Best Regards
