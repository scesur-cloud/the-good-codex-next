const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function rm(p) {
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
function cp(src, dst) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.cpSync(src, dst, { recursive: true });
}

const out = path.join(process.cwd(), "desktop_dist");
rm(out);
fs.mkdirSync(out, { recursive: true });

// 1) Next standalone
// Next build sonrası: .next/standalone + .next/static + public
const standaloneSrc = path.join(process.cwd(), ".next", "standalone");
const staticSrc = path.join(process.cwd(), ".next", "static");
const publicSrc = path.join(process.cwd(), "public");

if (!fs.existsSync(standaloneSrc)) {
    throw new Error("Missing .next/standalone. Ensure next.config output='standalone' and pnpm build ran.");
}

cp(standaloneSrc, path.join(out, "standalone"));
cp(staticSrc, path.join(out, "standalone", ".next", "static"));
if (fs.existsSync(publicSrc)) cp(publicSrc, path.join(out, "standalone", "public"));

// 2) Compile worker TS → JS
console.log("Compiling worker for desktop...");
execSync("npx tsc -p desktop/worker/tsconfig.json", { stdio: "inherit" });

// Output: desktop/worker/dist/desktop/worker/worker.js (due to structure preservation)
const workerJs = path.join(process.cwd(), "desktop", "worker", "dist", "desktop", "worker", "worker.js");
if (!fs.existsSync(workerJs)) throw new Error(`Missing compiled worker.js at ${workerJs}`);

cp(workerJs, path.join(out, "worker", "worker.js"));

console.log("desktop_prep done:", out);
