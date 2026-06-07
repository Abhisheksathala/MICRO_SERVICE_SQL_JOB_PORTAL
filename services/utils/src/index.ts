import express from "express";
import "dotenv/config";
import cors from "cors";
import route from "./route.js";
import { v2 as cloudinary } from 'cloudinary'
import { startSendMailConsumer } from "./consumer.js";



const config = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
}



cloudinary.config(config);




const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


app.use('/api/utils', route)

//start consumer
startSendMailConsumer()


app.listen(process.env.PORT, () => {
  console.log(`Utils service is running on port ${process.env.PORT}`)
})

export default app;