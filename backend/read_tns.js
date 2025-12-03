const fs = require('fs');
const path = require('path');

const tnsPath = path.join(__dirname, 'wallet/tnsnames.ora');

try {
    if (fs.existsSync(tnsPath)) {
        console.log('--- tnsnames.ora Content ---');
        console.log(fs.readFileSync(tnsPath, 'utf8'));
        console.log('----------------------------');
    } else {
        console.log('File not found:', tnsPath);
    }
} catch (err) {
    console.error('Error reading file:', err);
}
