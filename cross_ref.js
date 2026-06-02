const fs = require('fs');
const path = require('path');

const srcDir = 'd:\\Autours\\frontend\\src';
const apiPath = 'd:\\Autours\\frontend\\api.json';

// Get all files in src directory
function getFiles(dir, files = []) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getFiles(filePath, files);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
            files.push(filePath);
        }
    }
    return files;
}

const files = getFiles(srcDir);
const foundEndpoints = new Set();
const endpointRegex = /['"\`](\/api\/[^'"\`]+|\/[a-z0-9_-]+\/[a-z0-9_-]+)['"\`]/ig;
const axiosRegex = /(?:api|axios)\.(?:get|post|put|delete|patch)\(['"\`]([^'"\`]+)['"\`]/ig;

for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = axiosRegex.exec(content)) !== null) {
        foundEndpoints.add(match[1].split('?')[0].replace(/\$\{.*?\}/g, '{id}'));
    }
}

// Additional manual ones
foundEndpoints.add('/blog-categories');
foundEndpoints.add('/blogs');
foundEndpoints.add('/filter/vehicles');

const apiData = JSON.parse(fs.readFileSync(apiPath, 'utf8'));
const documentedEndpoints = new Set();
const endpointMap = new Map();

for (const section of apiData.api_documentation.sections) {
    for (const ep of section.endpoints) {
        documentedEndpoints.add(ep.path);
        endpointMap.set(ep.path, ep);
    }
}

const unusedEndpoints = [];
const usedEndpoints = [];

for (const ep of documentedEndpoints) {
    let isUsed = false;
    for (const used of foundEndpoints) {
        if (ep.includes(used) || used.includes(ep)) {
            isUsed = true;
            break;
        }
    }
    if (isUsed) {
        usedEndpoints.push(ep);
    } else {
        unusedEndpoints.push(ep);
    }
}

console.log('--- Unused Endpoints ---');
unusedEndpoints.forEach(ep => console.log(ep));

console.log('\\n--- Missing Endpoints (Used but not in api.json) ---');
const missing = [];
for (const used of foundEndpoints) {
    let found = false;
    for (const ep of documentedEndpoints) {
        if (ep.includes(used) || used.includes(ep)) {
            found = true;
            break;
        }
    }
    if (!found) {
        missing.push(used);
        console.log(used);
    }
}

// Generate new api.json content with missing ones added
const newSection = {
    name: "Newly Added Endpoints",
    description: "Endpoints that were used but not documented",
    endpoints: missing.map(m => ({
        method: "ANY",
        path: m,
        description: "Auto-detected endpoint",
        responses: { "200": { "description": "Success" } }
    }))
};

apiData.api_documentation.sections.push(newSection);

fs.writeFileSync('d:\\Autours\\frontend\\api_updated.json', JSON.stringify(apiData, null, 2));
fs.writeFileSync('d:\\Autours\\frontend\\unused_endpoints.json', JSON.stringify(unusedEndpoints, null, 2));

console.log('\\nDone! Updated API written to api_updated.json and unused ones to unused_endpoints.json.');
