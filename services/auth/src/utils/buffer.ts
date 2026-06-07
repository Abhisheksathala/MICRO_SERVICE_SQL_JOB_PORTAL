import DataURIParser from "datauri/parser.js";
import path from "path";

const parser = new DataURIParser();


const getbuffer = (file: any) => {
  const extName = path.extname(file?.originalname).toString();
  console.log(extName, "extname")
  console.log(file.buffer, "buffer")
  return parser.format(extName, file?.buffer)
}


export default getbuffer;