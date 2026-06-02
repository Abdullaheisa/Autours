const http = require('http');

http.get('http://localhost:8000/api/test-dashboard-debug', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('STATUS:', res.statusCode);
      console.log('TOTAL VEHICLES IN DB:', parsed.total_vehicles);
      console.log('DISTINCT SUPPLIERS IN VEHICLES:', parsed.distinct_suppliers);
      console.log('VEHICLES LIST:', parsed.vehicles);
      console.log('USERS:', parsed.users);
    } catch (e) {
      console.log('Failed to parse JSON. Raw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Error fetching API:', err);
});
