const uploadLocal = require('../utils/uploadLocal');

//A video and an image are required
module.exports.uploadPreviewMedia = uploadLocal.fields([{name: 'preview-image', maxCount: 1}, {name: 'preview-video', maxCount: 1}]);

// req.file = {
//   'preview-image': [
//     {
//       fieldname: 'preview-image',
//       originalname: 'Remote_logo.png',
//       encoding: '7bit',
//       mimetype: 'image/png',
//       destination: './media',
//       filename: 'aa3d7408-0b2d-4e93-bd00-87570bffe021Remote_logo.png',
//       path: 'media/aa3d7408-0b2d-4e93-bd00-87570bffe021Remote_logo.png',
//       size: 50623
//     }
//   ],
//   'preview-video': [
//     {
//       fieldname: 'preview-video',
//       originalname: 'Venice_5.mp4',
//       encoding: '7bit',
//       mimetype: 'video/mp4',
//       destination: './media',
//       filename: '9d595deb-c4e0-486e-b1e8-19be76094e15Venice_5.mp4',
//       path: 'media/9d595deb-c4e0-486e-b1e8-19be76094e15Venice_5.mp4',
//       size: 14809155
//     }