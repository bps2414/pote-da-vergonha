import fs from 'fs';
import path from 'path';

const audio = fs.readFileSync('js/audio.js', 'utf-8');
const camera = fs.readFileSync('js/camera.js', 'utf-8');
const storage = fs.readFileSync('js/storage.js', 'utf-8');
const mockData = fs.readFileSync('js/mock-data.js', 'utf-8');
const state = fs.readFileSync('js/state.js', 'utf-8');
const tribunal = fs.readFileSync('js/tribunal.js', 'utf-8');
const potFinance = fs.readFileSync('js/pot-finance.js', 'utf-8');
const gamification = fs.readFileSync('js/gamification.js', 'utf-8');
const app = fs.readFileSync('js/app.js', 'utf-8');

function stripESM(code) {
  return code
    .replace(/^\s*import\s+[\s\S]*?;\s*$/gm, '')
    .replace(/^\s*export\s+const\s+/gm, 'const ')
    .replace(/^\s*export\s+function\s+/gm, 'function ')
    .replace(/^\s*export\s+class\s+/gm, 'class ')
    .replace(/^\s*export\s+default\s+/gm, '');
}

const bundledCode = `
// Universal Production Bundle for Quem Falta Se Ferra
(function() {
  'use strict';
  
  // 1. Audio Engine
  ${stripESM(audio)}
  
  // 2. Camera Engine
  ${stripESM(camera)}
  
  // 3. Storage Layer
  ${stripESM(storage)}
  
  // 4. State Management
  ${stripESM(state)}
  
  // 5. Tribunal Module
  ${stripESM(tribunal)}
  
  // 6. Finance & Settlement Module
  ${stripESM(potFinance)}
  
  // 7. Gamification & Ranking Module
  ${stripESM(gamification)}
  
  // 8. Master App Controller
  ${stripESM(app)}
})();
`;

fs.writeFileSync('js/app.bundle.js', bundledCode, 'utf-8');
console.log('✅ Generated js/app.bundle.js successfully! Size:', bundledCode.length);
