// const fs = require('fs');
// export const getFolders = (entry) => {
//    const dirs = fs.readdirSync(entry)
//    const dirsWithoutIndex = dirs.filter(name => name !== 'index.ts').filter(name => name !== 'assets')
//    return dirsWithoutIndex
// }

// export const getFiles = (entry, extensions = [], excludeExtensions = []) => {
//   let fileNames = [];
//   const dirs = fs.readdirSync(entry);
//   dirs.forEach((dir) => {
//     const path = `${entry}/${dir}`;
   
//     if (fs.lstatSync(path).isDirectory()) {
//       fileNames = [
//         ...fileNames,
//         ...getFiles(path, extensions, excludeExtensions),
//       ];

//       return;
//     }

//     if (!excludeExtensions.some((exclude) => dir.endsWith(exclude))
//       && extensions.some((ext) => dir.endsWith(ext))
//     ) {
//       fileNames.push(path);
//     }
//   });
//   return fileNames;
// };

const fs = require('fs');
const path = require('path');

export const getComponentsFolders = (entry) => {
   const dirs = fs.readdirSync(entry)
   const dirsWithoutIndex = dirs.filter(name => name !== 'index.ts' && name !== 'assets')
   return dirsWithoutIndex
};

export const getFiles = (entry, extensions = [], excludeExtensions = []) => {
  let fileNames = [];
  const dirs = fs.readdirSync(entry);
  dirs.forEach((dir) => {
    const path = `${entry}/${dir}`;

    if (fs.lstatSync(path).isDirectory()) {
      fileNames = [
        ...fileNames,
        ...getFiles(path, extensions, excludeExtensions),
      ];

      return;
    }

    if (!excludeExtensions.some((exclude) => dir.endsWith(exclude))
      && extensions.some((ext) => dir.endsWith(ext))
    ) {
      fileNames.push(path);
    }
  });
  return fileNames;
};




/**
 * getFiles function to dynamically fetch files with specific extensions from a given folder.
 * 
 * @param {string} folder - The folder path to search in.
 * @param {Array<string>} extensions - An array of file extensions to filter by (e.g., ['css']).
 * @returns {Array<string>} - A list of file names (without path) matching the specified extensions.
 */
export function getCssFiles (folder, extensions) {
  // Read the contents of the folder
  const files = fs.readdirSync(folder);

  // Filter files based on the extensions passed in the 'extensions' array
  const filteredFiles = files.filter(file => {
    const extname = path.extname(file).slice(1);  // Get file extension (remove leading dot)
    return extensions.includes(extname);  // Check if the file's extension is in the allowed extensions list
  });

  // Return only the file names (not the full path)
  return filteredFiles;
}