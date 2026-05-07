const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const buildDir = path.join(root, "build");

async function run(command, cwd) {
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = command.split(" ");
        const proc = spawn(cmd, args, {
            cwd,
            stdio: "inherit",
            shell: true
        });

        proc.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command failed: ${command} in ${cwd}`));
        });
    });
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
} else if (!command) {
    console.log("Usage: node scripts/manage.js <build|dev>");
}
