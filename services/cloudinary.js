const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function uploadImage(dataUrl, folder = 'hill_valley') {
  return cloudinary.uploader.upload(dataUrl, {
    folder,
    use_filename: true,
    resource_type: 'image'
  });
}

module.exports = { uploadImage };
