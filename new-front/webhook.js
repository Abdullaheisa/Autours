const http = require('http');
const { spawn } = require('child_process');
const url = require('url');

// Port to listen on for webhook requests
const PORT = 9000;

// The secret password required to trigger the webhook
const SECRET_TOKEN = 'autours_deploy_secure2026kgyjfvjhbiuohin651615';

const server = http.createServer((req, res) => {
    // Parse the URL to read query parameters
    const parsedUrl = url.parse(req.url, true);

    // Trigger deployment on /deploy for ANY method (GET or POST)
    if (parsedUrl.pathname === '/deploy') {
        
        // SECURITY CHECK: Verify the secret token
        if (parsedUrl.query.secret !== SECRET_TOKEN) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('403 Forbidden: Invalid or missing secret token.\n');
            console.log(`[${new Date().toISOString()}] Blocked unauthorized deploy attempt from IP: ${req.socket.remoteAddress}`);
            return;
        }

        // Set headers for HTTP streaming so the browser displays logs in real-time
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Content-Type-Options': 'nosniff'
        });
        
        // Browsers like Chrome buffer the first ~1024 bytes before rendering.
        // We pad the response with spaces so it renders immediately.
        res.write(' '.repeat(2048) + '\n');

        const startTime = new Date().toISOString();
        res.write(`[${startTime}] Starting deployment pipeline...\n\n`);
        console.log(`[${startTime}] Deployment triggered.`);

        // Use 'spawn' instead of 'exec' so we can capture output line-by-line
        const deployProcess = spawn('./deploy.sh', { cwd: '/var/www/app/new-front' });

        // Stream standard output to the browser and PM2 logs
        deployProcess.stdout.on('data', (data) => {
            res.write(data.toString());
            process.stdout.write(data.toString()); 
        });

        // Stream standard errors to the browser and PM2 logs
        deployProcess.stderr.on('data', (data) => {
            res.write(`[STDERR] ${data.toString()}`);
            process.stderr.write(data.toString());
        });

        // When the script finishes, end the browser connection
        deployProcess.on('close', (code) => {
            const finishMsg = `\n[${new Date().toISOString()}] Deployment finished with exit code ${code}\n`;
            res.write(finishMsg);
            res.end();
            console.log(finishMsg);
        });

    } else if (parsedUrl.pathname === '/clear-cache') {
        // SECURITY CHECK: Verify the secret token
        if (parsedUrl.query.secret !== SECRET_TOKEN) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('403 Forbidden: Invalid or missing secret token.\n');
            console.log(`[${new Date().toISOString()}] Blocked unauthorized cache clear attempt from IP: ${req.socket.remoteAddress}`);
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Content-Type-Options': 'nosniff'
        });
        res.write(' '.repeat(2048) + '\n');
        
        const startTime = new Date().toISOString();
        res.write(`[${startTime}] Clearing fetch cache...\n\n`);
        console.log(`[${startTime}] Cache clear triggered.`);

        const { exec } = require('child_process');
        exec('rm -rf .next/cache/fetch-cache/*', { cwd: '/var/www/app/new-front' }, (error, stdout, stderr) => {
            if (error) {
                res.write(`\n[ERROR] Failed to clear cache: ${error.message}\n`);
            } else {
                res.write(`\nCache cleared successfully.\n`);
            }
            if (stderr) res.write(`[STDERR] ${stderr}\n`);
            res.end();
            console.log(`[${new Date().toISOString()}] Cache clear finished.`);
        });

    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found.\n');
    }
});

server.listen(PORT, () => {
    console.log(`Webhook listener running on port ${PORT}...`);
});
