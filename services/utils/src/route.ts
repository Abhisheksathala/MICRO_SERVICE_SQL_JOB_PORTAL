import { Router } from "express";
import { v2 as cloudinary } from 'cloudinary';


const router: Router = Router();


router.post('/upload', async (req, res) => {
  try {
    const { buffer, public_id } = req.body;
    if (!buffer || !public_id) {
      return res.status(400).json({ message: "Buffer and public_id are required" });
    }
    if (public_id) {
      await cloudinary.uploader.destroy(public_id)
    }
    const cloud = await cloudinary.uploader.upload(buffer)
    return res.status(200).json({
      message: "File uploaded successfully",
      success: true,
      url: cloud.secure_url,
      public_id: cloud.public_id
    })

  } catch (error) {
    return res.status(500).json({ message: "Internal server error", success: false })
  }
})

export default router