const { app, BrowserWindow, Tray, Menu, nativeImage } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");

let mainWindow = null;
let tray = null;
let serverProc = null;
let workerProc = null;

function getFreePort() {
    return new Promise((resolve, reject) => {
        const srv = net.createServer();
        srv.listen(0, "127.0.0.1", () => {
            const { port } = srv.address();
            srv.close(() => resolve(port));
        });
        srv.on("error", reject);
    });
}

function dbPath() {
    // SQLite dosyası userData içinde taşınabilir olsun
    return path.join(app.getPath("userData"), "data", "prod.db");
}

function ensureDirs(fs) {
    const dir = path.dirname(dbPath());
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function spawnNodeScript(scriptPath, extraEnv = {}) {
    // Electron child process'leri Node gibi çalıştırmak için
    const env = {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        ...extraEnv,
    };

    return spawn(process.execPath, [scriptPath], {
        env,
        stdio: "inherit",
    });
}

async function createWindow(url) {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        show: true,
        webPreferences: {
            // güvenlik için nodeIntegration kapalı
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    await mainWindow.loadURL(url);

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

function setupTray() {
    // basit bir ikon: (istersen later gerçek icon)
    const icon = nativeImage.createEmpty();
    tray = new Tray(icon);

    const menu = Menu.buildFromTemplate([
        {
            label: "Open Dashboard",
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                } else {
                    // we should have the url stored globally if we want to recreate
                }
            },
        },
        { type: "separator" },
        {
            label: "Quit",
            click: () => app.quit(),
        },
    ]);

    tray.setToolTip("The Good Codex");
    tray.setContextMenu(menu);
}

function setAutostart(enable) {
    // mac/win için login item
    app.setLoginItemSettings({
        openAtLogin: enable,
    });
}

function killProc(p) {
    if (!p) return;
    try {
        p.kill();
    } catch { }
}

app.on("before-quit", () => {
    killProc(workerProc);
    killProc(serverProc);
});

app.whenReady().then(async () => {
    const fs = require("fs");
    ensureDirs(fs);

    const port = await getFreePort();

    // Standalone server.js path: build sonrası resources içine kopyalanacak
    const serverJs = path.join(process.resourcesPath, "standalone", "server.js");
    const workerJs = path.join(process.resourcesPath, "worker", "worker.js");

    // DB + env
    const commonEnv = {
        DATABASE_URL: `file:${dbPath()}`,
        NODE_ENV: "production",
        PORT: String(port),
        HOSTNAME: "127.0.0.1"
    };

    // Next server
    serverProc = spawnNodeScript(serverJs, commonEnv);

    // Worker
    workerProc = spawnNodeScript(workerJs, commonEnv);

    const url = `http://127.0.0.1:${port}/dashboard`;

    // Wait a bit for server to start
    setTimeout(async () => {
        await createWindow(url);
        setupTray();
    }, 2000);

    // Solo default: autostart açık
    setAutostart(true);
});

app.on("window-all-closed", () => {
    // macOS'ta genelde app kapanmaz, tray üzerinden yönetilir
    if (process.platform !== "darwin") app.quit();
});
