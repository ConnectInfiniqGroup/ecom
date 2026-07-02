const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

const targetDir = '/Users/pavithan/Pavithan/test/shopadroidbysajanthini/src';

walk(targetDir, (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    if (!file.endsWith('.jsx') && !file.endsWith('.js')) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove the invalid backend URL prefix used for formatting image URLs
    content = content.replace(/https:\/\/TechStorealarm\.com\.au\/backend\/public/g, '');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed image URL prefix in', file);
    }
  });
});
