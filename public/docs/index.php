<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autours API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css">
    <link rel="icon" type="image/png" href="/favicon.ico">
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin: 0;
            background: #fafafa;
        }
        .swagger-ui .topbar {
            background-color: #f9d602;
            padding: 10px 0;
        }
        .swagger-ui .topbar-wrapper {
            display: flex;
            align-items: center;
        }
        .swagger-ui .topbar-wrapper .link {
            display: flex;
            align-items: center;
        }
        .swagger-ui .topbar-wrapper .link img {
            height: 40px;
        }
        .swagger-ui .topbar-wrapper .link span {
            color: #000;
            font-weight: bold;
            margin-left: 10px;
        }
        .swagger-ui .info .title {
            color: #000;
        }
        .swagger-ui .btn.authorize {
            background-color: #f9d602;
            border-color: #d4b800;
            color: #000;
        }
        .swagger-ui .btn.authorize:hover {
            background-color: #d4b800;
        }
        .swagger-ui .btn.authorize svg {
            fill: #000;
        }
        .swagger-ui .opblock.opblock-post {
            border-color: #49cc90;
            background: rgba(73, 204, 144, .1);
        }
        .swagger-ui .opblock.opblock-get {
            border-color: #61affe;
            background: rgba(97, 175, 254, .1);
        }
        .swagger-ui .opblock.opblock-put {
            border-color: #fca130;
            background: rgba(252, 161, 48, .1);
        }
        .swagger-ui .opblock.opblock-delete {
            border-color: #f93e3e;
            background: rgba(249, 62, 62, .1);
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: "/docs/swagger.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                tryItOutEnabled: true,
                validatorUrl: null
            });
            window.ui = ui;
        };
    </script>
</body>
</html>

