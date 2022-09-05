// import helper modules from web3storag and the path module
import { Web3Storage, File, getFilesFromPath } from "web3.storage";
const { resolve } = require("path");

// function to handle incoming requests
export default async function handler(req, res) {
    if (req.method === "POST") {
      return await storeEventData(req, res);
    } else {
      return res
        .status(405)
        .json({ message: "Method not allowed", success: false });
    }
}
// called if incoming request is a POST
// tries to get the event data from the request body and store the data
// when succsess the CID will be returnd
async function storeEventData(req, res) {
    const body = req.body;
    try {
      const files = await makeFileObjects(body);
      const cid = await storeFiles(files);
      return res.status(200).json({ success: true, cid: cid });
    } catch (err) {
      return res
        .status(500)
        .json({ error: "Error creating event", success: false });
    }
} 

//create a json file that includes metadata passed from the req.body object.
async function makeFileObjects(body) {
    const buffer = Buffer.from(JSON.stringify(body));
  
    const imageDirectory = resolve(process.cwd(), `public/images/${body.image}`);
    const files = await getFilesFromPath(imageDirectory);
  
    files.push(new File([buffer], "data.json"));
    return files;
}

function makeStorageClient() {
    return new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
}
//store json file to Web3.storage and return CID
async function storeFiles(files) {
    const client = makeStorageClient();
    const cid = await client.put(files);
    return cid;
}