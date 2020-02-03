/* eslint-disable no-console */
const express = require('express');
const fs = require('fs');
const multer = require('multer');
const { createWorker } = require('tesseract.js');
require('dotenv').config();

const app = express();
const worker = createWorker({
  logger: (m) => console.log(m),
});


app.set('views', './web');
app.set('view engine', 'ejs');
app.use(express.static('web'));

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage }).single('avatar');

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log(err);

      (async () => {
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(data);
        res.send(text);
        //   await worker.terminate();
      })();
    });
  });
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
