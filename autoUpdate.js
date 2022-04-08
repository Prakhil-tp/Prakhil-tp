const fs = require("fs");
const axios = require("axios");

const URL = "https://dev.to/api/articles?username=prakhil_tp";

/**
 * IIFE to update README.md
 */

(async () => {
  // Fetch Dev.to Article as JSON
  const { data } = await axios.get(URL);
  const recentArticles = data.slice(0, process.env.BLOG_DISPLAY_COUNT);

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
