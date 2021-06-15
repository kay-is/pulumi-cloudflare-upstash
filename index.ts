import * as cloudflare from "@pulumi/cloudflare";
import * as fs from "fs";

const workerCode = fs.readFileSync(__dirname + "/worker.js", {
  encoding: "utf-8",
});

const blogScript = new cloudflare.WorkerScript("blog-script", {
  name: "blog-script",
  content: workerCode,
  plainTextBindings: [{ name: "DB_URL", text: "<UPSTASH_DB_URL>" }],
  secretTextBindings: [{ name: "DB_TOKEN", text: "<UPSTASH_DB_TOKEN>" }],
});

new cloudflare.WorkerRoute("blog-route", {
  zoneId: "<CLOUDFLARE_ZONE_ID>",
  pattern: "example.com/posts",
  scriptName: blogScript.name,
});
