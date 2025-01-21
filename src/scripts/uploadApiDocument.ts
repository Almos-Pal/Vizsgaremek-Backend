// import * as fs from 'fs';
// import * as path from 'path';


// // Get the working directory (where the script is run from)
// const workingDir = process.cwd();
// const docsPath = path.join(workingDir, 'src', 'docs');
// const apiFilePath = path.join(docsPath, 'api.yaml');
// const res = fetch('http://localhost:3000/api-yaml').then((response) => {
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     return response.blob();
//   })
//   const content = res.then((blob) => {
//     return blob.text();
//   });

// // Ensure the `src/docs` directory exists
// if (!fs.existsSync(docsPath)) {
//     fs.mkdirSync(docsPath, { recursive: true });
//     console.log(`Directory "${docsPath}" created successfully.`);
// } else {
//     console.log(`Directory "${docsPath}" already exists.`);
// }

// // Write the content "hello" to `api.yaml`
//   fs.writeFile(apiFilePath,  content, (err) => {
//     if (err) {
//         console.error(`Error writing to file "${apiFilePath}":`, err);
//         return;
//     }
//     console.log(`File "${apiFilePath}" created successfully with content: "${content}"`);
// });
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch'; // Ensure node-fetch is installed

// Get the working directory (where the script is run from)
const workingDir = process.cwd();
const docsPath = path.join(workingDir, 'src', 'docs');
const apiFilePath = path.join(docsPath, 'api.yaml');

// Ensure the `src/docs` directory exists
if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true });
    console.log(`Directory "${docsPath}" created successfully.`);
} else {
    console.log(`Directory "${docsPath}" already exists.`);
}

// Use an async IIFE (Immediately Invoked Function Expression) to handle async/await
(async () => {
    try {
        console.log('Fetching data from http://localhost:3000/api-yaml...');
        const response = await fetch('http://localhost:3000/api-yaml');
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const content = await response.text();

        // Write the content to the file
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
