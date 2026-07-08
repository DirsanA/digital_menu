import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file, folder = 'digital_menu') {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export async function uploadImageFromUrl(url, folder = 'digital_menu') {
  const result = await cloudinary.uploader.upload(url, {
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
}

export async function deleteImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}

export function getPublicIdFromUrl(url) {
  if (!url?.includes('cloudinary.com')) return null;
  const parts = url.split('/');
  const file = parts[parts.length - 1];
  return file.replace(/\.[^.]+$/, '');
}

export default cloudinary;
