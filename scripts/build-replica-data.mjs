import { createHash } from "node:crypto";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const liveDir = path.join(root, "live-pages");
const publicAssetDir = path.join(root, "public", "replica-assets");
const generatedDir = path.join(root, "src", "generated");
const stylesDir = path.join(root, "src", "styles");

const assetUrlPattern =
  /https?:\/\/(?:assets\.zyrosite\.com|cdn\.zyrosite\.com|images\.pexels\.com|videos\.pexels\.com|images\.unsplash\.com)[^"' <>)\\]+/g;

const pages = [
  { slug: "", file: "index.html" },
  { slug: "know-us", file: "know-us.html" },
  { slug: "drivers", file: "drivers.html" },
  { slug: "partner", file: "partner.html" },
  { slug: "investors", file: "investors.html" },
  { slug: "blog", file: "blog.html" },
  { slug: "contact-us", file: "contact-us.html" },
  { slug: "privacy-policy", file: "privacy-policy.html" },
  { slug: "drivers-contact", file: "drivers-contact.html" },
  { slug: "investors-contact", file: "investors-contact.html" },
  { slug: "letzryd-in-pact-with-mbsi", file: "letzryd-in-pact-with-mbsi.html" },
  {
    slug: "letzryd-and-yamaha-firm-in-pact-to-deploy-cng-car-fleet-in-bengaluru",
    file: "letzryd-and-yamaha-firm-in-pact-to-deploy-cng-car-fleet-in-bengaluru.html",
  },
  {
    slug: "letzryd-and-mbsi-announce-partnership-for-deployment-of-51-maruti-vehicles-to-enhance-urban-mobility-in-bengaluru",
    file: "letzryd-and-mbsi-announce-partnership-for-deployment-of-51-maruti-vehicles-to-enhance-urban-mobility-in-bengaluru.html",
  },
];

function decodeUrl(url) {
  return url
    .split("&quot;")[0]
    .split("\\&quot;")[0]
    .split("%22")[0]
    .replaceAll("&amp;", "&")
    .replaceAll("\\u0026", "&");
}

function assetName(url) {
  const parsed = new URL(decodeUrl(url));
  const hash = createHash("sha1").update(parsed.href).digest("hex").slice(0, 10);
  const base = path.basename(parsed.pathname).replace(/[^a-zA-Z0-9._-]/g, "-") || "asset";
  const ext = path.extname(base) || extensionForHost(parsed.hostname);
  const stem = ext ? base.slice(0, -ext.length) : base;
  return `${stem}-${hash}${ext}`;
}

function extensionForHost(hostname) {
  if (hostname.includes("videos.pexels.com")) return ".mp4";
  if (hostname.includes("images.unsplash.com")) return ".jpg";
  return ".bin";
}

async function download(url, localPath) {
  if (existsSync(localPath)) return;
  const response = await fetch(decodeUrl(url), {
    headers: { "user-agent": "Mozilla/5.0 LetzRyd local replica crawler" },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    throw new Error(`Failed ${response.status} ${response.statusText}: ${url}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(localPath, bytes);
}

function collectAssets(text, set) {
  for (const match of text.matchAll(assetUrlPattern)) {
    const url = decodeUrl(match[0]);
    if (!url.includes("traffic.txt")) set.add(url);
  }
}

function stripScripts(body) {
  return body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<astro-island\b[^>]*ClientHead[\s\S]*?<\/astro-island>/gi, "")
    .replace(/<astro-island\b[^>]*Integrations[\s\S]*?<\/astro-island>/gi, "")
    .replace(/<\/?astro-island\b[^>]*>/gi, "")
    .replace(/<!--\[-->|<!--\]-->|<!---->|<!--astro:end-->/g, "");
}

function titleFor(html, fallback) {
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim();
  if (title) return title;
  return fallback ? fallback.replaceAll("-", " ") : "Home";
}

const blogCards = [
  {
    href: "/letzryd-and-yamaha-firm-in-pact-to-deploy-cng-car-fleet-in-bengaluru",
    image:
      "https://images.unsplash.com/photo-1578803203370-8b000b589edd?auto=jpeg&fit=crop&w=1200&h=630",
    title: "LetzRyd and Yamaha firm in pact to deploy CNG car fleet in Bengaluru",
    author: "The Hindu Bureau",
    meta: "12/25/2024 · 1 min read",
  },
  {
    href:
      "/letzryd-and-mbsi-announce-partnership-for-deployment-of-51-maruti-vehicles-to-enhance-urban-mobility-in-bengaluru",
    image:
      "https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1440,h=756,fit=crop,f=jpeg/mxBMzbDvGQiQG9vJ/man-on-mountain-facebook-cover-dWxBngen96UqyqXl.png",
    title:
      "LetzRyd and MBSI Announce Partnership for Deployment of 51 Maruti Vehicles to Enhance Urban Mobility in Bengaluru",
    author: "Bangalore News Network",
    meta: "12/18/2024 · 3 min read",
  },
  {
    href: "/letzryd-in-pact-with-mbsi",
    image:
      "https://images.unsplash.com/photo-1586522471252-68f4b108ff2a?auto=jpeg&fit=crop&w=1200&h=630",
    title: "LetzRyd in pact with MBSI",
    author: "The Hans India",
    meta: "12/12/2024 · 1 min read",
  },
];

function blogCardsSection(rewrite, modifier = "") {
  const className = ["replica-blog-section", modifier].filter(Boolean).join(" ");
  return `<section class="${className}">
  <div class="replica-blog-section__inner">
    ${blogCards
      .map(
        (card) => `<a class="replica-blog-card" href="${card.href}">
      <span class="replica-blog-card__media">
        <img src="${rewrite(card.image)}" alt="" loading="eager">
      </span>
      <span class="replica-blog-card__category">NEWS AND MEDIA</span>
      <span class="replica-blog-card__title">${card.title}</span>
      <span class="replica-blog-card__author">${card.author}</span>
      <span class="replica-blog-card__meta">${card.meta}</span>
    </a>`,
      )
      .join("")}
  </div>
</section>`;
}

function injectBlogCards(generatedPages, rewrite) {
  const section = blogCardsSection(rewrite);
  generatedPages.home.html = generatedPages.home.html.replace(
    /(<section id="zfsSfe")/,
    `${section}$1`,
  );
  generatedPages.blog.html = generatedPages.blog.html.replace(
    /<section id="zA9rr8"[\s\S]*?<\/section>/,
    blogCardsSection(rewrite, "replica-blog-section--blog-page"),
  );
}

async function loadInstagramAssets() {
  const filePath = path.join(root, "instagram-assets.local.json");
  if (!existsSync(filePath)) return [];
  const text = await fs.readFile(filePath, "utf8");
  return JSON.parse(text);
}

function instagramFeedMarkup(items) {
  return items
    .map((item) => {
      const media =
        item.tag === "VIDEO"
          ? `<video src="${item.src}" poster="${item.poster || ""}" class="media-item replica-instagram-media" controls playsinline preload="metadata"></video>`
          : `<img src="${item.src}" class="media-item replica-instagram-media" alt="" loading="eager">`;

      return `<div class="media-wrapper loaded" data-animation-role="image" data-v-83ebaa8d>
        <a data-v-83ebaa8d title="Open instagram page of this image" href="${item.href}" rel="noopener" target="_blank">
          ${media}
        </a>
      </div>`;
    })
    .join("");
}

function injectInstagramFeed(generatedPages, items) {
  if (!items.length) return;
  generatedPages.home.html = generatedPages.home.html.replace(
    /(<div id="zGXtve" class="instagram-feed[^>]*>)[\s\S]*?(<\/div><\/div><div class="layout-element layout-element--layout layout-element transition transition--slide" style="--align:center;--justify:center;--m-element-margin:0 0 16px 0;--z-index:3;)/,
    `$1${instagramFeedMarkup(items)}$2`,
  );
}

const replicaBlogCss = `
.replica-blog-section{background:rgb(245,248,251);padding:158px 60px 82px;font-family:Poppins,Arial,sans-serif}
.replica-blog-section__inner{max-width:1224px;margin:0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:64px}
.replica-blog-card{display:block;color:rgb(26,26,26);text-decoration:none}
.replica-blog-card__media{display:block;width:100%;aspect-ratio:1.65/1;margin-bottom:28px;overflow:hidden;background:#fff}
.replica-blog-card__media img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .35s ease}
.replica-blog-card:hover .replica-blog-card__media img{transform:scale(1.035)}
.replica-blog-card__category{display:block;margin-bottom:25px;color:rgb(86,86,86);font-family:Montserrat,Arial,sans-serif;font-size:24px;font-weight:400;line-height:1.25;text-transform:uppercase}
.replica-blog-card__title{display:block;color:rgb(0,0,0);font-family:"Jacques Francois",serif;font-size:38px;font-weight:400;line-height:1.18;margin-bottom:21px}
.replica-blog-card__author,.replica-blog-card__meta{display:block;color:rgb(86,86,86);font-family:Montserrat,Arial,sans-serif;font-size:24px;font-weight:400;line-height:1.45}
.replica-blog-section--blog-page{padding-top:60px}
@media (max-width:919px){
  .replica-blog-section{padding:72px 16px 56px}
  .replica-blog-section__inner{grid-template-columns:1fr;gap:48px}
  .replica-blog-card__media{margin-bottom:22px}
  .replica-blog-card__category{font-size:20px;margin-bottom:16px}
  .replica-blog-card__title{font-size:32px}
  .replica-blog-card__author,.replica-blog-card__meta{font-size:20px}
}
`;

const replicaInstagramCss = `
.instagram-feed .media-wrapper{overflow:hidden;background:#000}
.instagram-feed .media-wrapper>a{display:block;width:100%;height:100%}
.instagram-feed .replica-instagram-media{display:block;width:100%;height:100%;object-fit:cover;background:#000}
`;

async function main() {
  await fs.mkdir(publicAssetDir, { recursive: true });
  await fs.mkdir(generatedDir, { recursive: true });
  await fs.mkdir(stylesDir, { recursive: true });

  const assetUrls = new Set();
  const rawPages = [];
  for (const page of pages) {
    const html = await fs.readFile(path.join(liveDir, page.file), "utf8");
    collectAssets(html, assetUrls);
    rawPages.push({ ...page, html });
  }

  const css = await fs.readFile(path.join(root, "live-slug.css"), "utf8");
  collectAssets(css, assetUrls);

  const fontCssUrl =
    "https://cdn.zyrosite.com/u1/google-fonts/font-faces?family=Jacques+Francois:wght@400&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;700&family=Raleway:wght@400;700&display=swap";
  let fontCss = "";
  try {
    const fontResponse = await fetch(fontCssUrl);
    fontCss = await fontResponse.text();
    collectAssets(fontCss, assetUrls);
  } catch {
    fontCss = "@import url('https://fonts.googleapis.com/css2?family=Jacques+Francois&family=Montserrat:wght@400;500;700&family=Poppins:wght@400;500;600;700&family=Raleway:wght@400;700&display=swap');";
  }

  const assetMap = {};
  for (const url of assetUrls) {
    const name = assetName(url);
    const localPath = path.join(publicAssetDir, name);
    assetMap[url] = `/replica-assets/${name}`;
    await download(url, localPath);
  }

  const rewrite = (text) => {
    let out = text;
    for (const [remote, local] of Object.entries(assetMap)) {
      out = out.split(remote).join(local);
      out = out.split(remote.replaceAll("&", "&amp;")).join(local);
    }
    return out.replaceAll("https://letzryd.com/", "/").replaceAll("https://letzryd.com", "/");
  };

  const generatedPages = {};
  for (const page of rawPages) {
    const body = page.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
    generatedPages[page.slug || "home"] = {
      slug: page.slug,
      title: titleFor(page.html, page.slug),
      html: rewrite(stripScripts(body)),
    };
  }
  injectBlogCards(generatedPages, rewrite);
  injectInstagramFeed(generatedPages, await loadInstagramAssets());

  const localFontCss = rewrite(fontCss);
  const localSiteCss = rewrite(css);
  await fs.writeFile(
    path.join(stylesDir, "replica.css"),
    `${localFontCss}\n${localSiteCss}\n\nastro-island,astro-slot,astro-static-slot{display:contents}.transition{will-change:transform,opacity}.replica-page form{pointer-events:auto}${replicaBlogCss}${replicaInstagramCss}`,
  );
  await fs.writeFile(
    path.join(generatedDir, "pages.json"),
    JSON.stringify(generatedPages),
  );
  await fs.writeFile(
    path.join(generatedDir, "routes.json"),
    JSON.stringify(pages.map(({ slug }) => slug)),
  );

  console.log(`Generated ${pages.length} pages and ${Object.keys(assetMap).length} local assets.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
