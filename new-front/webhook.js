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

        const clearProcess = spawn('sh', ['-c', 'rm -rfv .next/cache/fetch-cache/*'], { cwd: '/var/www/app/new-front' });

        clearProcess.stdout.on('data', (data) => {
            res.write(data.toString());
            process.stdout.write(data.toString());
        });

        clearProcess.stderr.on('data', (data) => {
            res.write(`[STDERR] ${data.toString()}`);
            process.stderr.write(data.toString());
        });

        clearProcess.on('close', (code) => {
            const finishMsg = `\n[${new Date().toISOString()}] Cache clear finished with exit code ${code}\n`;
            res.write(finishMsg);
            res.end();
            console.log(finishMsg);
        });

    } else if (parsedUrl.pathname === '/refresh-photos') {
        // SECURITY CHECK: Verify the secret token
        if (parsedUrl.query.secret !== SECRET_TOKEN) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('403 Forbidden: Invalid or missing secret token.\n');
            console.log(`[${new Date().toISOString()}] Blocked unauthorized photos refresh attempt from IP: ${req.socket.remoteAddress}`);
            return;
        }

        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Content-Type-Options': 'nosniff'
        });
        res.write('<!--' + ' '.repeat(2048) + '-->\n');
        res.write('<body style="background:#111; color:#0f0; font-family:monospace; padding:20px;">\n');
        res.write('<h2>Refreshing Vehicle Photos...</h2>\n');
        res.write('<pre id="log" style="white-space: pre-wrap;">');
        
        const startTime = new Date().toISOString();
        res.write(`[${startTime}] Refreshing vehicle photos...\n\n`);
        console.log(`[${startTime}] Photos refresh triggered.`);

        const refreshProcess = spawn('php', ['artisan', 'vehicles:refresh-photos'], { cwd: '/var/www/app' });

        let outputBuffer = '';

        refreshProcess.stdout.on('data', (data) => {
            const text = data.toString();
            outputBuffer += text;
            res.write(text.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
            process.stdout.write(text);
        });

        refreshProcess.stderr.on('data', (data) => {
            const text = data.toString();
            res.write(`<span style="color:red">[STDERR] ${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`);
            process.stderr.write(text);
        });

        refreshProcess.on('close', (code) => {
            const finishMsg = `\n[${new Date().toISOString()}] Photos refresh finished with exit code ${code}\n`;
            res.write(finishMsg);
            res.write('</pre>');
            
            // Extract the generated CSV filename from the logs
            const match = outputBuffer.match(/Report generated at: (.*?\.csv)/);
            if (match) {
                const csvPath = match[1];
                const filename = csvPath.split('/').pop();
                res.write(`
                <div style="margin-top:20px;">
                    <a id="downloadLink" href="/download?file=${encodeURIComponent(filename)}&secret=${SECRET_TOKEN}" style="display:inline-block; padding:10px 20px; background:#007bff; color:white; text-decoration:none; border-radius:5px; font-weight:bold; font-family:sans-serif;">Download ${filename}</a>
                </div>
                <script>
                    // Auto-click the download link after 1 second
                    setTimeout(() => {
                        document.getElementById('downloadLink').click();
                    }, 1000);
                </script>`);
            }
            
            res.write('</body>');
            res.end();
            console.log(finishMsg);
        });

    } else if (parsedUrl.pathname === '/download') {
        if (parsedUrl.query.secret !== SECRET_TOKEN) {
            res.writeHead(403);
            return res.end('403 Forbidden');
        }
        const filename = parsedUrl.query.file;
        if (!filename || !filename.endsWith('.csv') || filename.includes('/')) {
            res.writeHead(400);
            return res.end('Invalid file requested.');
        }
        const fs = require('fs');
        const filepath = `/var/www/app/storage/app/${filename}`;
        if (!fs.existsSync(filepath)) {
            res.writeHead(404);
            return res.end('File not found.');
        }
        res.writeHead(200, {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}"`
        });
        fs.createReadStream(filepath).pipe(res);

    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found.\n');
    }
});

server.listen(PORT, () => {
    console.log(`Webhook listener running on port ${PORT}...`);
});
