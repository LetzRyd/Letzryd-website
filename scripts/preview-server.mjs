import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const root = process.cwd();
const pages = JSON.parse(readFileSync(join(root, "src/generated/pages.json"), "utf8"));
const css = readFileSync(join(root, "src/styles/replica.css"), "utf8");
const port = Number(process.env.PORT || 4173);

const mime = {
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

const runtime = `
document.addEventListener("DOMContentLoaded", () => {
  const activate = (element) => {
    element.setAttribute("data-animation-state", "active");
    element.querySelectorAll("[data-animation-role='image'], [data-animation-role='block-element']").forEach((child) => child.setAttribute("data-animation-state", "active"));
  };
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && activate(entry.target)), { rootMargin: "0px 0px -8% 0px", threshold: 0.04 });
  document.querySelectorAll(".transition").forEach((element) => {
    observer.observe(element);
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) activate(element);
  });
  document.querySelectorAll("img").forEach((image) => {
    image.classList.add("loaded");
    image.closest("[data-animation-role='image']")?.classList.add("loaded");
  });
  document.querySelectorAll("[data-animation-role='image']").forEach((element) => element.classList.add("loaded"));
  document.querySelectorAll(".block-header__hamburger-menu").forEach((button) => {
    button.setAttribute("aria-expanded", "false");
    button.addEventListener("click", () => {
      const dropdown = button.closest(".block-header-layout-mobile")?.querySelector(".block-header-layout-mobile__dropdown");
      dropdown?.classList.toggle("block-header-layout-mobile__dropdown--open");
      button.classList.toggle("burger--active");
      button.setAttribute("aria-expanded", dropdown?.classList.contains("block-header-layout-mobile__dropdown--open") ? "true" : "false");
    });
  });
  document.querySelectorAll("form").forEach((form) => form.addEventListener("submit", (event) => event.preventDefault()));
});`;

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://localhost:${port}`);
  if (url.pathname.startsWith("/replica-assets/")) {
    const filePath = join(root, "public", url.pathname);
    if (existsSync(filePath)) {
      response.setHeader("content-type", mime[extname(filePath)] || "application/octet-stream");
      createReadStream(filePath).pipe(response);
      return;
    }
  }

  const slug = url.pathname.replace(/^\/|\/$/g, "");
  const page = pages[slug || "home"];
  if (!page) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.setHeader("content-type", "text/html; charset=utf-8");
  response.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${page.title}</title><style>${css}</style></head><body><main class="replica-page">${page.html}</main><script>${runtime}</script></body></html>`);
}).listen(port, () => {
  console.log(`Preview server running at http://localhost:${port}`);
});
