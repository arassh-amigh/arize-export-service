const express = require('express')
const { exec } = require("child_process")
const admin =  require('firebase-admin')
// require('firebase/auth')
require('firebase/storage')
// require('firebase/firestore')
// require('firebase/database')
const path = require('path');
const multer = require('multer');
const { uploadFile } = require('./uploadToFirebase')

var serviceAccount = require("./test.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket : 'gs://tripleearplatform.appspot.com'
})

const app = express();

const port = 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        // console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
  console.log(file.mimetype)
    // if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    // } else {
        // cb(null, false);
    // }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });

//Upload route
app.post('/upload', upload.single('file'), (req, res, next) => {
    try {
      uploadFile(admin , req.file.filename , '/uploads' , 'test/gltf/' , false)
      .then(() => {
        var input = req.file.filename
        var filenameWithNoExtension = input.substr(0, input.lastIndexOf('.')) || input;
        exec(`usd_from_gltf /usr/src/app/uploads/${req.file.filename} /usr/src/app/usd/${filenameWithNoExtension}.usdz`, (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`)
            res.status(500).json({ message: 'Something went wrong' })
          }
        
          if (stderr) {
            console.log(`stderr: ${stderr}`)
            res.status(500).json({ message: 'Something went wrong' })
          }

          console.log(`stdout: ${stdout}`)
            
          uploadFile(admin , filenameWithNoExtension+'.usdz' , '/usd' , 'test/usd/' , true)
          .then(() => {
            res.status(201).json({ message: 'File uploded successfully' })
          })
          .catch(() => {
            console.log(error)
            res.status(500).json({message: 'Something went wrong' })
          })
        });
      })
      .catch((error) => {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong' })
      })
    } catch (error) {
      console.error(error);
        
      res.status(500).json({ message: 'Something went wrong' })
    }
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`));
