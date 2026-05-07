const REQUIRED_ENV_KEYS = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"] as const;

export function validateRuntimeEnv() {
    const missingKeys = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);

    if (missingKeys.length) {
        throw new Error(`Missing required environment variables: ${missingKeys.join(", ")}`);
    }

    for (const key of ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"]) {
        const value = process.env[key];

        if (value && value.length < 16) {
            throw new Error(`${key} must contain at least 16 characters`);
        }
    }
}
