const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
 
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    region: process.env.AWS_REGION
})

const s3 = new aws.S3()

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return cb(new Error('Please upload JPG,JPEG, or PNG'))
    }

    cb(undefined, true)
}
 
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter,
    storage: multerS3({
    s3: s3,
    bucket: 'wisapedia-uploads',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname)
    },
  })
})

module.exports = upload;