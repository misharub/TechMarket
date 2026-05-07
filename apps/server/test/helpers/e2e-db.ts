import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(__dirname, "../../../..");

export function configureTestEnv() {
    const envFromFile = readRootEnv();
    const databaseUrl = process.env.DATABASE_URL_TEST ?? envFromFile.DATABASE_URL_TEST ?? buildDefaultTestUrl(envFromFile.DATABASE_URL);

    process.env.DATABASE_URL = databaseUrl;
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? envFromFile.JWT_ACCESS_SECRET ?? "test-access-secret";
    process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? envFromFile.JWT_REFRESH_SECRET ?? "test-refresh-secret";
    process.env.CLIENT_URL = process.env.CLIENT_URL ?? envFromFile.CLIENT_URL ?? "http://localhost:5173";

    // E2E-тесты должны быть воспроизводимыми: реальные OAuth-ключи из локального .env
    // не должны менять ожидаемый результат тестов. Для специальных OAuth-тестов можно
    // использовать отдельные переменные с суффиксом _TEST.
    process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID_TEST ?? "";
    process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET_TEST ?? "";
    process.env.GOOGLE_CALLBACK_URL =
        process.env.GOOGLE_CALLBACK_URL_TEST ?? "http://localhost:5000/api/auth/google/callback";
    process.env.VK_CLIENT_ID = process.env.VK_CLIENT_ID_TEST ?? "";
    process.env.VK_CLIENT_SECRET = process.env.VK_CLIENT_SECRET_TEST ?? "";
    process.env.VK_CALLBACK_URL = process.env.VK_CALLBACK_URL_TEST ?? "http://localhost:5000/api/auth/vk/callback";
    process.env.AI_PROVIDER = process.env.AI_PROVIDER_TEST ?? "";
    process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY_TEST ?? "";
    process.env.GEMINI_MODEL = process.env.GEMINI_MODEL_TEST ?? "gemini-2.5-flash";
}

export async function ensureTestDatabaseExists() {
    const testDatabaseUrl = process.env.DATABASE_URL;

    if (!testDatabaseUrl) {
        throw new Error("DATABASE_URL is required for e2e tests");
    }

    const url = new URL(testDatabaseUrl);
    const databaseName = url.pathname.replace("/", "");
    url.pathname = "/postgres";
    url.search = "";

    const { Client } = require("pg") as {
        Client: new (options: { connectionString: string }) => {
            connect: () => Promise<void>;
            query: (query: string, params?: unknown[]) => Promise<{ rowCount: number | null }>;
            end: () => Promise<void>;
        };
    };

    const client = new Client({ connectionString: url.toString() });
    await client.connect();

    try {
        const existingDatabase = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [databaseName]);

        if (!existingDatabase.rowCount) {
            await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
        }
    } finally {
        await client.end();
    }
}

export function resetAndSeedTestDatabase() {
    const env = {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
    };

    execFileSync(process.execPath, [prismaCliPath(), "migrate", "reset", "--force"], {
        cwd: repoRoot,
        env,
        stdio: "inherit",
    });
    execFileSync(process.execPath, ["prisma/seed.mjs"], {
        cwd: repoRoot,
        env,
        stdio: "inherit",
    });
}

function readRootEnv() {
    const envPath = resolve(repoRoot, ".env");

    if (!existsSync(envPath)) {
        return {} as Record<string, string>;
    }

    return Object.fromEntries(
        readFileSync(envPath, "utf8")
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith("#") && line.includes("="))
            .map((line) => {
                const [key, ...valueParts] = line.split("=");
                const value = valueParts.join("=").trim().replace(/^"|"$/g, "");

                return [key.trim(), value];
            }),
    );
}

function buildDefaultTestUrl(databaseUrl: string | undefined) {
    if (!databaseUrl) {
        return "postgresql://postgres:postgres@localhost:5432/techmarket_test?schema=public";
    }

    const url = new URL(databaseUrl.replace(/^"|"$/g, ""));
    url.pathname = "/techmarket_test";

    return url.toString();
}

function quoteIdentifier(value: string) {
    return `"${value.replace(/"/g, '""')}"`;
}

function prismaCliPath() {
    return resolve(repoRoot, "node_modules", "prisma", "build", "index.js");
}
