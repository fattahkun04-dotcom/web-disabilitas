import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string,
  fileType: string
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sahabatABK/${folder}`,
        resource_type: fileType === "application/pdf" ? "raw" : "image",
        format: fileType === "application/pdf" ? "pdf" : undefined,
      },
      (error, result) => {
        if (error) reject(error);
        else
          resolve({
            url: result!.secure_url,
            publicId: result!.public_id,
          });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete from Cloudinary:", error);
  }
};
