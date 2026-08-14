import fs from 'fs';

const css = fs.readFileSync('styles/bundle.css', 'utf-8');
let html = fs.readFileSync('index.html', 'utf-8');

// Replace CSS in style tag
html = html.replace(/<style>[\s\S]*?<\/style>/, '<style>\n' + css + '\n</style>');

// Clean up static text placeholders in HTML
html = html.replace('id="header-room-code">BONDE1</span>', 'id="header-room-code">CRIAR SALA</span>');
html = html.replace('id="pot-members-count" class="pot-members-count">4 amigos no bonde</span>', 'id="pot-members-count" class="pot-members-count">1 amigo no bonde</span>');
html = html.replace('id="pot-value-number" class="pot-value">45.00</span>', 'id="pot-value-number" class="pot-value">0.00</span>');

// Hide sponsor banner by default
html = html.replace('id="pot-sponsor-banner" class="pot-sponsor-banner"', 'id="pot-sponsor-banner" class="pot-sponsor-banner" style="display:none;"');

// Replace script module with app.bundle.js
html = html.replace('<script type="module" src="./js/app.js"></script>', '<script defer src="./js/app.bundle.js"></script>');

fs.writeFileSync('index.html', html, 'utf-8');
console.log('✅ Updated index.html successfully! Size:', html.length);
