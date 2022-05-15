const cloudinary = require('cloudinary');
require('dotenv').config();

const key = process.env.CLOUNDINARY_API_KEY;

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: key, 
    api_secret: process.env.CLOUNDINARY_API_SECRET 
  });
  
  const cd_upload_promise = (filepath, filename) => {
      return new Promise((resolve, reject) => {
          cloudinary.v2.uploader.upload(filepath, {public_id: filename}, (err, result) => {
              if (err) {
                  reject(err)
                } else {
                    resolve(result);
                }
            })
        })
    };
    
    //req.file, added my multer, is required for this middleware to upload.
  const uploadToCloud = async(req, res, next) => {
      console.log("------uploading-------");
      console.log(process.env.CLOUNDINARY_API_KEY);
     try {
        const result = await cd_upload_promise(req.file.path, req.file.filename);
        res.send(result);
     } catch (err) {
         next(err)
     }
  }

  module.exports = uploadToCloud;
