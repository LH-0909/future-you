import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const url = 'http://127.0.0.1:5173/#01';
async function ready() {
  try {
    const r = await fetch('http://127.0.0.1:5173/src/main.jsx', { signal: AbortSignal.timeout(1200) });
    return r.ok && (await r.text()).includes('ReferenceExperience');
  } catch { return false; }
}
if (!existsSync(resolve(project, 'node_modules/vite/bin/vite.js'))) {
  console.error('请先运行“启动程序.cmd”安装项目依赖，再使用全屏启动。');
  process.exit(1);
}
if (!await ready()) {
  const server = spawn(process.execPath, [resolve(project, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5173', '--strictPort'], { cwd: project, detached: true, stdio: 'ignore', windowsHide: true });
  server.unref();
  for (let i = 0; i < 30 && !await ready(); i++) await new Promise(r => setTimeout(r, 300));
  if (!await ready()) { console.error('项目服务未能启动。请运行“启动程序.cmd”查看提示，或检查 5173 端口。'); process.exit(1); }
}
const browser = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
].find(existsSync);
if (!browser) {
  console.log(`请在独立浏览器中打开 ${url}，按 F11 进入全屏。`);
  process.exit(1);
}
const window = spawn(browser, ['--new-window', '--start-fullscreen', url], { detached: true, stdio: 'ignore' });
window.unref();
console.log('已打开独立浏览器全屏窗口。按 F11 退出浏览器全屏；Ctrl + 滚轮可以放大画面。');
