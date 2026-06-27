import { spawn } from "node:child_process";

const containerName = process.env.E2E_DB_CONTAINER_NAME ?? "satojay-gym-e2e-db";
const dbPort = process.env.E2E_DB_PORT ?? "55432";
const dbUser = "postgres";
const dbPassword = "postgres";
const dbName = "satojay_gym";
const databaseUrl = `postgresql://${dbUser}:${dbPassword}@127.0.0.1:${dbPort}/${dbName}?schema=public`;
const playwrightArgs = process.argv.slice(2);

const commandName = (command: string) => (process.platform === "win32" ? `${command}.cmd` : command);

function run(command: string, args: string[], options: { env?: Record<string, string>; quiet?: boolean } = {}) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(commandName(command), args, {
      env: { ...process.env, ...options.env },
      stdio: options.quiet ? "ignore" : "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code ?? "unknown"}`));
    });
  });
}

async function cleanup() {
  await run("docker", ["rm", "-f", containerName], { quiet: true }).catch(() => undefined);
}

async function waitForDatabase() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      await run("docker", ["exec", containerName, "pg_isready", "-U", dbUser, "-d", dbName], { quiet: true });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("E2E database did not become ready in time.");
}

async function main() {
  const e2eEnv = {
    DATABASE_URL: databaseUrl,
    DATABASE_URL_UNPOOLED: databaseUrl,
  };

  await cleanup();

  await run("docker", [
    "run",
    "--rm",
    "-d",
    "--name",
    containerName,
    "-e",
    `POSTGRES_USER=${dbUser}`,
    "-e",
    `POSTGRES_PASSWORD=${dbPassword}`,
    "-e",
    `POSTGRES_DB=${dbName}`,
    "-p",
    `${dbPort}:5432`,
    "postgres:16-alpine",
  ]);

  await waitForDatabase();
  await run("pnpm", ["prisma:deploy"], { env: e2eEnv });
  await run("pnpm", ["prisma:seed"], { env: e2eEnv });
  await run("pnpm", ["exec", "playwright", "test", ...playwrightArgs], { env: e2eEnv });
}

process.once("SIGINT", () => {
  cleanup().finally(() => process.exit(130));
});

process.once("SIGTERM", () => {
  cleanup().finally(() => process.exit(143));
});

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(cleanup);
