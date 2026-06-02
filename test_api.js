const http = require('http');

http.get('http://localhost:8000/get/profit?page=1&per_page=10', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    console.log('RESPONSE:', data);
  });
}).on('error', (err) => {
  console.error('Error fetching API:', err);
});
