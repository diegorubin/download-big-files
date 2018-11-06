const express = require('express');
const mustacheExpress = require('mustache-express');
const fs = require('fs');
const app = express();

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
 
app.get('/', function (req, res) {
  res.render('home', {
    'files': [
      {'path': 'mountain.jpg'},
      {'path': 'bigfile.tar.bz2'}
    ]
  });
});

app.get('/:file', function (req, res) {
  fs.open('files/' + req.params.file, 'r', function(err, fd) {
    if (err) {
      res.status(500);
      res.send(err);
    } else {
      fs.fstat(fd, function(err, stats) {
        fs.close(fd, function() {
          const size = (stats.size / 1048576).toFixed(2);
          res.send({
            size: size,
            parts: Math.ceil(size/10)
          });
        });
      });
    }
  });
});

app.get('/:file/:part', function (req, res) {
  
  const mb = 1048576;

  fs.open('files/' + req.params.file, 'r', function(err, fd) {
    if (err) {
      res.status(500);
      res.send(err);
    } else {
      fs.fstat(fd, function(err, stats) {
        const bufferSize=stats.size,
          buffer=Buffer.alloc(bufferSize);

        let bytesRead = (req.params.part - 1) * mb,
          chunkSize=512;
  
        while (bytesRead < bufferSize) {
          if ((bytesRead + chunkSize) > bufferSize) {
            chunkSize = (bufferSize - bytesRead);
          }
          fs.read(fd, buffer, bytesRead, chunkSize, bytesRead);
          bytesRead += chunkSize;
        }
        fs.close(fd, function() {
          res.send(buffer);
        });
      });
    }
  });

});
 
app.listen(3000);
