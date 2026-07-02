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
    if (!file.endsWith('.jsx') && !file.endsWith('.js') && !file.endsWith('.css') && !file.endsWith('.html')) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace adroit with TechStore (case preserving ideally, but we'll do basic replacement)
    content = content.replace(/adroit/g, 'TechStore');
    content = content.replace(/Adroit/g, 'TechStore');
    content = content.replace(/ADROIT/g, 'TECHSTORE');

    // Add logo import if Demo Logo is present
    if (content.includes('Demo Logo')) {
      if (!content.includes('import Logo from')) {
         const importStr = `import Logo from "../Assets/Images/logo.png";\n`;
         content = importStr + content;
      }
      content = content.replace(/<span[^>]*>Demo Logo<\/span>/g, '<img src={Logo} alt="TechStore Logo" style={{ height: "100%", maxHeight: "65px", objectFit: "contain" }} />');
    }

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  });
});
