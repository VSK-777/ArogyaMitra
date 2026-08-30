const http = require('http');

async function test() {
    console.log("Starting test...");

    // Function to make HTTP requests
    const request = (method, path, body, token) => {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 8080,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            if (token) options.headers['Authorization'] = `Bearer ${token}`;
            
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
            });
            req.on('error', e => reject(e));
            if (body) req.write(JSON.stringify(body));
            req.end();
        });
    };

    // 1. Authenticate as a doctor to get token (find a doctor in DB)
    // Actually, we don't know a valid doctor mobile/password.
    // Let's use a Receptionist or Admin?
    // Wait, let's login with a known user.
}
test();
