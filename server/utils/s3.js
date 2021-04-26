const { uuid } = require('uuidv4');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const config = require('config');


const fileFilterImage = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
const fileFilterAudio = (req, file, cb) => {
  if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav' ||
    file.mimetype === 'audio/ogg' || file.mimetype === 'audio/aac') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

AWS.config.update(
  {
    accessKeyId: config.AWS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_KEY
  }
)

const s3 = new AWS.S3();

let uploadImage = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.AWS_BUKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    acl: 'public-read',
    key: function (req, file, cb) {
      let fileUp = file.originalname.split(".");
      const fileType = fileUp[fileUp.length - 1];
      cb(null, `${req.s3Key}${fileType}`)
    },
    contentType: function (req, file, cb) {
      cb(null, file.mimetype)
    },

  }),
  fileFilter: fileFilterImage
})

let uploadAudio = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.AWS_BUKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    acl: 'public-read',
    key: function (req, file, cb) {
      let fileUp = file.originalname.split(".");
      const fileType = fileUp[fileUp.length - 1];
      cb(null, `${req.s3Key}${fileType}`)
    },
    contentType: function (req, file, cb) {
      cb(null, file.mimetype)
    },

  }),
  fileFilter: fileFilterAudio
})

const singleFileUploadImage = uploadImage.single('file');
const singleFileUploadAudio = uploadAudio.single('file');


module.exports.uploadToS3Image = (req, res) => {
  req.s3Key = `image/${uuid()}.`;
  return new Promise((resolve, reject) => {
    return singleFileUploadImage(req, res, err => {
      if (req.file != undefined) {
        let file = req.file.originalname.split(".");
        const fileType = file[file.length - 1];
        let downloadUrl = `https://${config.AWS_BUKET_NAME}.s3.eu-west-2.amazonaws.com/${req.s3Key}${fileType}`;
        // console.log(downloadUrl);


        if (err) return reject(err);
        return resolve(downloadUrl)
      } else {
        reject(new Error("Format error: Allowed formats for images: .jpeg | .jpg | .png."));
      }
    })
  })
}


module.exports.uploadToS3Audio = (req, res) => {
  req.s3Key = `music/${uuid()}.`;
  return new Promise((resolve, reject) => {
    return singleFileUploadAudio(req, res, err => {
      if (req.file != undefined) {
        let file = req.file.originalname.split(".");
        const fileType = file[file.length - 1];
        let downloadUrl = `https://${config.AWS_BUKET_NAME}.s3.eu-west-2.amazonaws.com/${req.s3Key}${fileType}`;
        // console.log(downloadUrl);


        if (err) return reject(err);
        return resolve(downloadUrl)
      } else {
        reject(new Error("Format error: Allowed formats for audio: .mp3 | .aac | .wav | .oga."));
      }
    })
  })
}