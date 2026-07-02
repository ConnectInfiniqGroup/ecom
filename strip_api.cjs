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

const mockApiStr = `
const api = {
  get: async (url) => {
    console.log("Local mock GET:", url);
    return { data: { data: [], products: [], items: [], cart_total: 0, cart_count: 0, average_rating: 5, total_reviews: 10 } };
  },
  post: async (url, data) => {
    console.log("Local mock POST:", url, data);
    return { data: { success: true, token: "demo_token", data: { role_id: 2, full_name: "Demo User", email: "demo@example.com" } } };
  }
};
`;

walk(targetDir, (err, results) => {
  if (err) throw err;
  results.forEach(file => {
    if (!file.endsWith('.jsx') && !file.endsWith('.js')) return;
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Remove the import statement for api
    content = content.replace(/import api from ".*?api";?\n?/g, '');
    content = content.replace(/import api from '.*?api';?\n?/g, '');

    // If the file uses api.get or api.post, inject the mockApiStr at the top (after other imports)
    if ((content.includes('api.get') || content.includes('api.post')) && original.match(/import api from/)) {
      // Find the last import statement to inject after it
      const lastImportMatch = [...content.matchAll(/^import .*;$/gm)].pop();
      if (lastImportMatch) {
         const index = lastImportMatch.index + lastImportMatch[0].length;
         content = content.slice(0, index) + '\n' + mockApiStr + content.slice(index);
      } else {
         content = mockApiStr + '\n' + content;
      }
    }

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Processed API removal in', file);
    }
  });
});
