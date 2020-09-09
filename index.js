const fs = require("fs");
const https = require("https");
const { promisify } = require("util");

const url = "https://dev.to/api/articles?username=prakhil_tp";

https.get[promisify.custom] = async (options) => {
  return new Promise((resolve, reject) => {
    https
      .get(options, (response) => {
        response.end = new Promise((resolve) =>
          response.on("end", resolve)
        );
        resolve(response);
      })
      .on("error", reject);
  });
};

const request = promisify(https.get);

(async () => {
  const response = await request(url);
  let body = "";
  response.on("data", (data) => (body += data));
  await response.end;
  body = JSON.parse(body);
  const lastFiveArticles = body.slice(0, 5);

  const ArticleMarkDown = lastFiveArticles.reduce((acc, item) => {
    return acc + `- [${item.title}](${item.url}) \n`;
  }, "\n");

  const readme = fs.readFileSync("README.md", "utf-8");
  const updatedReadme = readme.replace(
    /(?<=Recent Blog Posts\n)[\s\S]*(?=&nbsp)/gm,
    ArticleMarkDown
  );
  fs.writeFileSync("README.md", updatedReadme, "utf-8");
})();
