
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch'; 


const workingDir = process.cwd();
const docsPath = path.join(workingDir, 'src', 'docs');
const apiFilePath = path.join(docsPath, 'api.yaml');

if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true });
    console.log(`Directory "${docsPath}" created successfully.`);
} else {
    console.log(`Directory "${docsPath}" already exists.`);
}

(async () => {
    try {
        console.log('Fetching data from http://localhost:8000/api-yaml...');
        const response = await fetch('http://localhost:8000/api-yaml');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const content = await response.text();

        fs.writeFile(apiFilePath, content, (err) => {
            if (err) {
                console.error(`Error writing to file "${apiFilePath}":`, err);
                return;
            }
            console.log(`File "${apiFilePath}" created successfully with content from the server.`);
        });
    } catch (error) {
        console.error('Error fetching data from localhost:', error);
    }
})();