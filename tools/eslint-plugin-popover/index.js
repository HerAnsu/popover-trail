import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rulesDir = path.join(__dirname, 'rules');

const rules = {};
const files = fs.readdirSync(rulesDir).filter((file) => file.endsWith('.js'));

await Promise.all(
  files.map(async (file) => {
    const ruleName = path.basename(file, '.js');
    const mod = await import(`./rules/${ruleName}.js`);
    rules[ruleName] = mod.default || mod;
  }),
);

export default {
  rules,
};

export { rules };
