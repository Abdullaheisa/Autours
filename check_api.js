const fs = require('fs');

const apiPath = 'd:\\Autours\\frontend\\api.json';
const apiData = JSON.parse(fs.readFileSync(apiPath, 'utf8'));

if (apiData.info && apiData.item) {
    console.log('Format: Postman Collection');
    console.log('Total items:', apiData.item.length);
} else if (apiData.openapi || apiData.swagger) {
    console.log('Format: OpenAPI/Swagger');
    console.log('Total paths:', Object.keys(apiData.paths || {}).length);
} else {
    console.log('Format:', typeof apiData);
    if (typeof apiData === 'object') {
        console.log('Keys:', Object.keys(apiData));
    }
}
