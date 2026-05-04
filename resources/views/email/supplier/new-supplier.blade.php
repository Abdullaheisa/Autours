<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: auto;
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007BFF;
            color: white;
            padding: 10px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .footer {
            font-size: 12px;
            color: #777;
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h2>New Supplier Registration Notification</h2>
    </div>
    <p>Hi Team,</p>
    <p>We are pleased to inform you that a new supplier has registered on <a href="http://www.autours.net">www.autours.net</a>.</p>

    <p><strong>Supplier Details:</strong></p>
    <ul>
        <li><strong>Company Name:</strong> {{json_decode($body)->company}}</li>
        <li><strong>Contact Name:</strong> {{json_decode($body)->name}}</li>
        <li><strong>Email:</strong> {{json_decode($body)->email}}</li>
        <li><strong>Phone:</strong> {{json_decode($body)->phone_num}}</li>
    </ul>

    <p>To review the supplier's registration details and manage their account, please visit the following link:</p>
    <p><a href="{{url('/memberships')}}">View Supplier Details</a></p>

    <p>If you have any questions or require further assistance, please do not hesitate to reach out.</p>

    <p>Best regards,<br>
        The www.autours.net Team</p>

    <div class="footer">
        <p>&copy; 2025 www.autours.net. All rights reserved.</p>
    </div>
</div>
</body>
</html>
