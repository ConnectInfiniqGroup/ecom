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

const betterMockApiStr = `
const api = {
  get: async (url) => {
    console.log("Local mock GET:", url);
    if (url.includes("getcategory")) {
      return { data: [
        { category_id: 1, categoryname: "Laptops", slug: "laptops" },
        { category_id: 2, categoryname: "Smartphones", slug: "smartphones" },
        { category_id: 3, categoryname: "Accessories", slug: "accessories" }
      ] };
    }
    if (url.includes("cart/view")) {
      return { data: { data: { items: [], cart_total: 0, cart_count: 0 } } };
    }
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

    // Find the injected api block and replace it
    const regex = /const api = \{\s+get: async \(url\) => \{\s+console\.log\("Local mock GET:", url\);\s+return \{ data: \{ data: \[\], products: \[\], items: \[\], cart_total: 0, cart_count: 0, average_rating: 5, total_reviews: 10 \} \};\s+\},\s+post: async \(url, data\) => \{\s+console\.log\("Local mock POST:", url, data\);\s+return \{ data: \{ success: true, token: "demo_token", data: \{ role_id: 2, full_name: "Demo User", email: "demo@example.com" \} \} \};\s+\}\s+\};/g;

    content = content.replace(regex, betterMockApiStr.trim());

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed API mock in', file);
    }
  });
});
