const http = require('http');

// We need a token to test this, but first let's just see if we get 404 or 401 (JSON) vs HTML.
// If the route exists, we should get 401 Unauthorized (JSON) because of auth middleware.
// If the route doesn't exist, we get 404 (HTML from catch-all).

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/students',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);

    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Body snippet:', body.substring(0, 100));
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.end();
