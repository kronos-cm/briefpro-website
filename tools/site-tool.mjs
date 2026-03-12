#!/usr/bin/env node

import http from "http";
import { promises as fs } from "fs";
import path from "path";

const cwd = process.cwd();
const staticEntries = [
  "index.html",
  "impressum.html",
  "privacy.html",
  "styles.css",
  "robots.txt",
  "sitemap.xml",
  "CNAME",
  ".nojekyll",
  "assets",
  "en",
];
const requiredSiteFiles = [
  "index.html",
  "en/index.html",
  "impressum.html",
  "privacy.html",
  "styles.css",
  "assets/briefpro-logo-light.jpg",
  "assets/briefpro-logo-dark.jpg",
];

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        args[key] = true;
      } else {
        args[key] = next;
        i += 1;
      }
    } else if (token.startsWith("-")) {
      const key = token.slice(1);
      const next = argv[i + 1];
      if (!next || next.startsWith("-")) {
        args[key] = true;
      } else {
        args[key] = next;
        i += 1;
      }
    } else {
      args._.push(token);
    }
  }
  return args;
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function copyEntry(srcRoot, destRoot, entryName) {
  const src = path.join(srcRoot, entryName);
  const dest = path.join(destRoot, entryName);
  if (!(await exists(src))) {
    return;
  }
  await fs.cp(src, dest, { recursive: true });
}

async function buildSite(outputDir) {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });
  for (const entry of staticEntries) {
    await copyEntry(cwd, outputDir, entry);
  }
  console.log(`Built site artifact at ${outputDir}`);
}

async function validateSite(outputDir) {
  const missing = [];
  for (const rel of requiredSiteFiles) {
    const target = path.join(outputDir, rel);
    if (!(await exists(target))) {
      missing.push(rel);
    }
  }
  if (missing.length > 0) {
    throw new Error(`Missing required files in ${outputDir}: ${missing.join(", ")}`);
  }
  console.log(`Validated site bundle at ${outputDir}`);
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    case ".txt":
      return "text/plain; charset=utf-8";
    case ".xml":
      return "application/xml; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}

async function createServer(rootDir, port) {
  const server = http.createServer(async (req, res) => {
    try {
      const rawPath = req.url?.split("?")[0] || "/";
      const normalized = decodeURIComponent(rawPath).replace(/^\/+/, "");
      let localPath = path.join(rootDir, normalized);

      if (rawPath.endsWith("/")) {
        localPath = path.join(rootDir, normalized, "index.html");
      }

      if (!(await exists(localPath))) {
        const fallback = path.join(rootDir, "index.html");
        if (await exists(fallback)) {
          localPath = fallback;
        } else {
          res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
          res.end("Not Found");
          return;
        }
      }

      const stat = await fs.stat(localPath);
      if (stat.isDirectory()) {
        localPath = path.join(localPath, "index.html");
      }

      const body = await fs.readFile(localPath);
      res.writeHead(200, { "content-type": contentTypeFor(localPath) });
      res.end(body);
    } catch (error) {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end(`Server error: ${error.message}`);
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });

  console.log(`Serving ${rootDir} on http://127.0.0.1:${port}`);
  process.on("SIGINT", () => {
    server.close(() => process.exit(0));
  });
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const args = parseArgs(rest);
  const outputDir = path.resolve(cwd, args.dir || "_site");
  const port = Number(args.port || 4173);

  switch (command) {
    case "build":
      await buildSite(outputDir);
      break;
    case "validate":
      await validateSite(outputDir);
      break;
    case "serve":
      await validateSite(outputDir);
      await createServer(outputDir, port);
      break;
    default:
      console.log(
        [
          "Usage: node tools/site-tool.mjs <command>",
          "",
          "Commands:",
          "  build [--dir _site]",
          "  validate [--dir _site]",
          "  serve [--dir _site] [--port 4173]",
        ].join("\n"),
      );
      process.exit(command ? 1 : 0);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
