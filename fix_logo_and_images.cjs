const fs = require('fs');
const path = require('path');

// 1. Update Logo Size in all files
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

    // Increase max height of logo
    content = content.replace(/maxHeight: "65px"/g, 'maxHeight: "100px"');
    content = content.replace(/maxHeight: "50px"/g, 'maxHeight: "85px"');
    content = content.replace(/height: "65px"/g, 'height: "100%"');

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Increased logo size in', file);
    }
  });
});

// 2. Fix Product Images in Data.js
const dataJsPath = path.join(targetDir, 'Constants', 'Data.js');
if (fs.existsSync(dataJsPath)) {
  let dataContent = fs.readFileSync(dataJsPath, 'utf8');
  // Add images array to each product
  const updatedDataContent = dataContent.replace(
    /image: (LAPTOP_IMG|PHONE_IMG|ACC_IMG),\s*imgurl: \1/g,
    'image: $1, imgurl: $1, images: [{imgurl: $1}]'
  );
  if (dataContent !== updatedDataContent) {
    fs.writeFileSync(dataJsPath, updatedDataContent, 'utf8');
    console.log('Fixed product images array in Data.js');
  }
}
