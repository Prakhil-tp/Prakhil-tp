const fs = require("fs");
const https = require("https");
const { promisify } = require("util");

const url = "https://dev.to/api/articles?username=prakhil_tp";

/**
 * Custom https get module
 * @returns {Promise} - Resolved value is API response as text.
 */

https.get[promisify.custom] = (options) => {
  return new Promise((resolve, reject) => {
    https
      .get(options, (response) => {
        response.end = new Promise((resolve) => response.on("end", resolve));
        resolve(response);
      })
      .on("error", reject);
  });
};

const request = promisify(https.get);

/**
 * IIFE to update README.md
 */

(async () => {
  // Fetch Dev.to Article as JSON
  const response = await request(url);
  let body = "";
  response.on("data", (data) => (body += data));
  await response.end;
  body = JSON.parse(body);

  const recentArticles = body.slice(0, process.env.BLOG_DISPLAY_COUNT);

  // Convert JSON to MarkDown
  const ArticleMarkDown = recentArticles.reduce((acc, item) => {
    return acc + `- [${item.title}](${item.url}) \n`;
  }, "\n");

  // Update README.md
  const readme = fs.readFileSync("README.md", "utf-8");
  const updatedReadme = readme.replace(
    /(?<=Recent Articles \/ Blog Posts\n)[\s\S]*(?=&nbsp)/gm,
    ArticleMarkDown
  );
  fs.writeFileSync("README.md", updatedReadme, "utf-8");
})();
