import multer from "multer";



const storage = multer.memoryStorage();



export const UploadFile: any = multer({
  storage
}).single('file')
