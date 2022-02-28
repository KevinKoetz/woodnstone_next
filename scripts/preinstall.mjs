import fs from "fs/promises";
import path from "path";

//Setup .env.local with default, non-secret values
writeFileIfNonExist("../admin", ".env.local", `
PORT="3500"
BROWSER="none"
`)

writeFileIfNonExist("../backend", ".env.local", `
PORT="4000"
MONGO_DB=
`)

writeFileIfNonExist("../frontend", ".env.local", `
PORT="3000"
`)

/**
 * Checks if the file exists, if not, creates it and writes content to it
 * @param {string} relPath relative Path to the directory in which the file should be created
 * @param {string} filename 
 * @param {string} content 
 */
async function writeFileIfNonExist(relPath,filename, content){
    const fullPath = path.join(path.dirname(process.argv[1]), relPath)
    const dir = await fs.readdir(fullPath)
    if(!dir.includes(filename))fs.writeFile(path.join(fullPath, filename), content)
}