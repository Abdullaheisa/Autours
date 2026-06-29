const http = require('http');
const { spawn } = require('child_process');

// Port to listen on for webhook requests
const PORT = 9000;

const server = http.createServer((req, res) => {
    // Trigger deployment on /deploy for ANY method (GET or POST)
    // This allows you to just visit the URL in your browser
    if (req.url === '/deploy') {
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

    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found.\n');
    }
});

server.listen(PORT, () => {
    console.log(`Webhook listener running on port ${PORT}...`);
});
