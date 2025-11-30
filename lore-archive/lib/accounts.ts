import { scryptSync, timingSafeEqual } from "node:crypto";

type AccountSeed = {
    id: string;
    username: string;
    displayName: string;
    password: string;
    salt: string;
};

export interface StoredAccount {
    id: string;
    username: string;
    displayName: string;
    passwordHash: string;
    salt: string;
}

export type PublicAccount = Omit<StoredAccount, "passwordHash" | "salt">;

const ACCOUNT_SEEDS: AccountSeed[] = [
    {
        id: "flams1",
        username: "flams",
        displayName: "flams",
        password: process.env.AUTH_ACCOUNT_ARCHIVIST_PASSWORD ?? "1234",
        salt: process.env.AUTH_ACCOUNT_ARCHIVIST_SALT ?? "2e3d8b4fa3a84620",
    },
    {
        id: "germanopoli1",
        username: "germanopoli",
        displayName: "germanopoli",
        password: process.env.AUTH_ACCOUNT_CHRONICLE_PASSWORD ?? "1234",
        salt: process.env.AUTH_ACCOUNT_CHRONICLE_SALT ?? "ab90c12d77894f0e",
    },
    {
        id: "random1",
        username: "random",
        displayName: "random",
        password: process.env.AUTH_ACCOUNT_SCRIBE_PASSWORD ?? "1234",
        salt: process.env.AUTH_ACCOUNT_SCRIBE_SALT ?? "6f2d3c4b5a6e7d8c",
    },
];

function hashPassword(password: string, salt: string): string {
    return scryptSync(password, salt, 64).toString("hex");
}

const PREDEFINED_ACCOUNTS: StoredAccount[] = ACCOUNT_SEEDS.map(({ password, ...rest }) => ({
    ...rest,
    passwordHash: hashPassword(password, rest.salt),
}));

export function verifyAccountCredentials(username: string, password: string): PublicAccount | null {
    const normalizedUsername = username.trim().toLowerCase();
    const account = PREDEFINED_ACCOUNTS.find(
        (entry) => entry.username.toLowerCase() === normalizedUsername,
    );

    if (!account) {
        return null;
    }

    const attemptedHash = hashPassword(password, account.salt);
    const attemptedBuffer = Buffer.from(attemptedHash, "hex");
    const storedBuffer = Buffer.from(account.passwordHash, "hex");

    if (attemptedBuffer.length !== storedBuffer.length) {
        return null;
    }

    if (!timingSafeEqual(attemptedBuffer, storedBuffer)) {
        return null;
    }

    return {
        id: account.id,
        username: account.username,
        displayName: account.displayName,
    };
}