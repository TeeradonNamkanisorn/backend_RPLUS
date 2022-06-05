const cloudinary = require('cloudinary').v2;
const { clearMediaLocal } = require('../services/clearFolder');
const {v4 : uuidv4} = require('uuid');
const util = require('util');
const createError = require('./createError');
require('dotenv').config();


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUNDINARY_API_KEY, 
    api_secret: process.env.CLOUNDINARY_API_SECRET 
  });
  //OPTIONAL: WRAPPING INSIDE A PROMISE
  const vid_upload_promise = (filepath) => {
      return new Promise((resolve, reject) => {
          cloudinary.uploader.upload(filepath, {resource_type: "video", chunk_size: 500000000}, (err, result) => {
              if (err) {
                  reject(err)
                } else {
                    resolve(result);
                }
            })
        })
    };
    const img_upload_promise = util.promisify(cloudinary.uploader.upload);
    
    const destroy = util.promisify(cloudinary.uploader.destroy);
    const upload = util.promisify(cloudinary.uploader.upload);

    

    const uploadVidAndImageToCloudMW = async (req, res, next) => {
        try {
            const img_prom = img_upload_promise(req.files["preview-image"][0].path);
            const vid_prom = vid_upload_promise(req.files["preview-video"][0].path, uuidv4());

            const result = await Promise.all([img_prom, vid_prom]);
            console.log(result); //
            req.imageData = result[0];
            req.videoData = result[1];

            clearMediaLocal();
            next();
        } catch (err) {
            next(err);
        }
    }
    //Can upload either or both
    const uploadEitherOrBothVideoAndImageToCloudMW = async (req, res, next) => {
        try {
            let img_prom = Promise.resolve(null);
            let vid_prom = Promise.resolve(null);
           
            if (req.files["preview-image"]) {
                img_prom = img_upload_promise(req.files["preview-image"][0].path);
            }

            if (req.files["preview-video"]) {
                vid_prom = vid_upload_promise(req.files["preview-video"][0].path);
            }

            const result = await Promise.all([img_prom, vid_prom]);

            req.imageData = result[0];
            req.videoData = result[1];

            console.log("upload success");

            next();

        } catch (error) {
            next(error)
        }
    }


    //req.file, added my multer, is required for this middleware to upload.
  const uploadVideoToCloudMW = async(req, res, next) => {
     try {
        let result;
        if (req.file) {
             result = await vid_upload_promise(req.file.path, req.file.filename
        );
        req.uploadData = result;
        req.uploadedFileType = "video";
    }
        clearMediaLocal();
        next()
     } catch (err) {
         next(err)
     }
  }

  const uploadPdf = async (req, res, next) => {
      try {
          if (!req?.pdf?.filename) createError("certificate pdf not found", 500);
          const result = await upload(req.file.filename);
          console.log(result);
          req.certificateData = result;
          next();
      } catch (err) {
          next(err)
      }
  }

//  result: {
//     "asset_id": "c026c11f263d1a2d639393971a739ce5",
//     "public_id": "8da12762-7675-4855-b88f-d2bca3192f13sunrise_cloud.mp4",
//     "version": 1652630550,
//     "version_id": "dc97c896d94ff8e7de3ef205e8f79f3b",
//     "signature": "e912199459cd7f553c35b952e63153d5327bfa74",
//     "width": 1280,
//     "height": 720,
//     "format": "mp4",
//     "resource_type": "video",
//     "created_at": "2022-05-15T16:02:30Z",
//     "tags": [],
//     "pages": 0,
//     "bytes": 34936098,
//     "type": "upload",
//     "etag": "f5cb6f1b5741ed72810c68c1dae73ca5",
//     "placeholder": false,
//     "url": "http://res.cloudinary.com/dd59rpcj4/video/upload/v1652630550/8da12762-7675-4855-b88f-d2bca3192f13sunrise_cloud.mp4.mp4",
//     "secure_url": "https://res.cloudinary.com/dd59rpcj4/video/upload/v1652630550/8da12762-7675-4855-b88f-d2bca3192f13sunrise_cloud.mp4.mp4",
//     "audio": {},
//     "video": {
//         "pix_format": "yuv420p",
//         "codec": "h264",
//         "level": 31,
//         "profile": "High",
//         "bit_rate": "4702772",
//         "dar": "16:9",
//         "time_base": "1/11988"
//     },
//     "frame_rate": 29.97,
//     "bit_rate": 4705752,
//     "duration": 59.392726,
//     "rotation": 0,
//     "original_filename": "8da12762-7675-4855-b88f-d2bca3192f13sunrise_cloud",
//     "nb_frames": 1780,
//     "api_key": "SECRET1111111"
// }


  module.exports = {
       cloudinary ,uploadVideoToCloudMW, uploadVidAndImageToCloudMW,
        uploadEitherOrBothVideoAndImageToCloudMW, destroy, upload, uploadPdf
    };
