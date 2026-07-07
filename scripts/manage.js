#!/usr/bin/env node
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const buildDir = path.join(root, "build");

async function run(command, cwd) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, {
            cwd,
            stdio: "inherit",
            shell: true
        });

        proc.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command failed: ${command} in ${cwd}`));
        });

        proc.on("error", (err) => {
            reject(err);
        });
    });
}

let clientProc = null;
let serverProc = null;
let isRestarting = false;
let isExiting = false;

function spawnDev(name, command, cwd, color) {
    const proc = spawn(command, { cwd, shell: true });
    const prefix = `\x1b[${color}m[${name}]\x1b[0m `;
    let atStartOfLine = true;

    const handleData = (data, stream) => {
        const str = data.toString();
        let output = "";
        for (let i = 0; i < str.length; i++) {
            if (atStartOfLine) {
                output += prefix;
                atStartOfLine = false;
            }
            output += str[i];
            if (str[i] === "\n") {
                atStartOfLine = true;
            }
        }
        stream.write(output);
    };

    proc.stdout.on("data", (data) => handleData(data, process.stdout));
    proc.stderr.on("data", (data) => handleData(data, process.stderr));

    return proc;
}

function killProc(proc) {
    if (!proc) return Promise.resolve();
    return new Promise((resolve) => {
        if (proc.exitCode !== null || proc.signalCode !== null) {
            resolve();
            return;
        }
        proc.once("exit", () => {
            resolve();
        });
        proc.kill("SIGTERM");
        const timeout = setTimeout(() => {
            proc.kill("SIGKILL");
            resolve();
        }, 2000);
        proc.once("exit", () => clearTimeout(timeout));
    });
}

function startServers() {
    console.log("Starting development servers...");
    clientProc = spawnDev("Client", "npm run dev", path.join(root, "client"), "32"); // Green
    serverProc = spawnDev("Server", "npm run dev", path.join(root, "server"), "34"); // Blue

    clientProc.on("exit", () => {
        clientProc = null;
    });
    serverProc.on("exit", () => {
        serverProc = null;
    });
}

async function restartServers() {
    if (isRestarting) return;
    isRestarting = true;
    console.log("\nRestarting development servers...");
    await Promise.all([
        killProc(clientProc),
        killProc(serverProc)
    ]);
    isRestarting = false;
    if (isExiting) return;
    startServers();
}

async function dev() {
    startServers();

    const cleanup = async () => {
        isExiting = true;
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
            process.stdin.pause();
        }
        console.log("\nStopping servers...");
        await Promise.all([
            killProc(clientProc),
            killProc(serverProc)
        ]);
        process.exit(0);
    };

    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);

    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", async (key) => {
            if (key === "\u0003") {
                await cleanup();
            } else if (key.toLowerCase() === "r") {
                await restartServers();
            }
        });
        console.log("Press 'r' to restart the dev servers.");
    }
}

async function build() {
    console.log("Cleaning build directory...");
    if (fs.existsSync(buildDir)) {
        fs.rmSync(buildDir, { recursive: true, force: true });
    }
    fs.mkdirSync(buildDir, { recursive: true });

    console.log("Building common...");
    await run("npm run build", path.join(root, "common"));

    console.log("Building server...");
    const serverDir = path.join(root, "server");
    await run("npm run build", serverDir);
    await run("npm run postbuild", serverDir);

    const apiBuildDir = path.join(buildDir, "api.orhandogan.com.tr");
    fs.mkdirSync(apiBuildDir, { recursive: true });
    fs.cpSync(path.join(serverDir, "dist"), apiBuildDir, { recursive: true });
    fs.rmSync(path.join(serverDir, "dist"), { recursive: true, force: true });

    console.log("Building client...");
    const clientDir = path.join(root, "client");
    await run("npm run build", clientDir);

    const clientBuildDir = path.join(buildDir, "comma.orhandogan.com.tr");
    fs.mkdirSync(clientBuildDir, { recursive: true });
    fs.cpSync(path.join(clientDir, "dist"), clientBuildDir, { recursive: true });
    fs.rmSync(path.join(clientDir, "dist"), { recursive: true, force: true });

    console.log("\nBuild successful!");
}

const command = process.argv[2];
if (command === "build") {
    build().catch(err => {
        console.error(err);
        process.exit(1);
    });
} else if (command === "dev") {
    dev().catch(err => {
        console.error(err);
        process.exit(1);
    });
} else {
    console.log("Usage: node scripts/manage.js <build|dev>");
}
