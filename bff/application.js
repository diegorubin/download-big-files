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
      {'path': 'sunset.jpg'}
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
        const bufferSize=stats.size,
          buffer=new Buffer(bufferSize);

        let bytesRead = 0,
          chunkSize=512;
  
        while (bytesRead < bufferSize) {
          if ((bytesRead + chunkSize) > bufferSize) {
            chunkSize = (bufferSize - bytesRead);
          }
          fs.read(fd, buffer, bytesRead, chunkSize, bytesRead);
          bytesRead += chunkSize;
        }
        res.send(buffer);
        fs.close(fd);
      });
    }
  });

});
 
app.listen(3000);
