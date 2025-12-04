const fetch = require('node-fetch');

async function testLoginApi() {
    try {
        console.log('Testing Login API...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'dds31',
                password: 'admin123'
            })
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);

    } catch (error) {
        console.error('Error:', error);
    }
}

testLoginApi();
