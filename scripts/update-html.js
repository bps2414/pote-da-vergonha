import fs from 'fs';

const css = fs.readFileSync('styles/bundle.css', 'utf-8');
const js = fs.readFileSync('js/app.bundle.js', 'utf-8');
let html = fs.readFileSync('index.html', 'utf-8');

// 1. Replace CSS in style tag
html = html.replace(/<style>[\s\S]*?<\/style>/, '<style>\n' + css + '\n</style>');

// 2. Fix meta tags
if (!html.includes('<meta name="mobile-web-app-capable" content="yes" />')) {
  html = html.replace(
    '<meta name="apple-mobile-web-app-capable" content="yes" />',
    '<meta name="mobile-web-app-capable" content="yes" />\n  <meta name="apple-mobile-web-app-capable" content="yes" />'
  );
}

// 3. Clean up static text placeholders in HTML
html = html.replace('id="header-room-code">BONDE1</span>', 'id="header-room-code">CRIAR SALA</span>');
html = html.replace('id="pot-members-count" class="pot-members-count">4 amigos no bonde</span>', 'id="pot-members-count" class="pot-members-count">0 amigos</span>');
html = html.replace('id="pot-value-number" class="pot-value">45.00</span>', 'id="pot-value-number" class="pot-value">0.00</span>');

// 4. Hide sponsor banner by default
html = html.replace('id="pot-sponsor-banner" class="pot-sponsor-banner"', 'id="pot-sponsor-banner" class="pot-sponsor-banner" style="display:none;"');

// 5. Embed JavaScript directly inline inside <script> at bottom of body
const scriptTag = `<script>\n${js}\n</script>`;
if (html.includes('<script defer src="./js/app.bundle.js"></script>')) {
  html = html.replace('<script defer src="./js/app.bundle.js"></script>', scriptTag);
} else if (html.includes('<script type="module" src="./js/app.js"></script>')) {
  html = html.replace('<script type="module" src="./js/app.js"></script>', scriptTag);
} else if (html.includes('<script>')) {
  html = html.replace(/<script>[\s\S]*?<\/script>\s*<\/body>/, scriptTag + '\n</body>');
} else {
  html = html.replace('</body>', scriptTag + '\n</body>');
}

fs.writeFileSync('index.html', html, 'utf-8');
console.log('✅ Generated 100% Self-Contained index.html! Size:', html.length);
