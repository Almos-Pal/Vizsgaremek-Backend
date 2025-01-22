import fs from 'fs';
export const checkIfFileOrDirectoryExists = (path: string): boolean => {
    //console.log(path);
    return fs.existsSync(path);
  };
  