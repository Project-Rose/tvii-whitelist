import express, { type Request, type Response } from "express";
import { logger } from "@/utils/logger";
import { parseServiceToken } from "./utils/token";
import db from "@/utils/db";
import { join } from "path";

const app = express();

app.get("/", async (req: Request, res: Response) => {
    const requiredHeaders = [
        // "x-nintendo-principal-id-09",
        // "x-nintendo-principal-id-12",
        // "x-nintendo-principal-id-02",
        // "x-nintendo-principal-id-01",
        // "x-nintendo-principal-id-03",
        // "x-nintendo-principal-id-04",
        "x-nintendo-country-code",
        // "x-nintendo-principal-id-08",
        "x-nintendo-service-token",
        // "x-nintendo-principal-id-06",
        // "x-nintendo-returned-from-other",
        // "x-nintendo-white-list-get-count",
        // "x-nintendo-principal-id-07",
        "x-nintendo-current-principal-id",
        // "x-nintendo-principal-id-10",
        // "x-nintendo-principal-id-11",
        // "x-nintendo-principal-id-05",
        // "x-nintendo-release-version",
    ];

    for (let i = 0; i < requiredHeaders.length; i++) {
        const header = requiredHeaders[i];
        if (!req.headers[header]) {
            logger.warn(
                "User attempted to access without required header: %s",
                header
            );
            return res
                .status(400)
                .sendFile(
                    join(__dirname, "..", "pages", "error", "pc_en.html")
                );
        }
    }

    const serviceToken = parseServiceToken(req);

    if (
        !serviceToken.pid ||
        !serviceToken.serial_number ||
        !serviceToken.access_key
    ) {
        logger.warn(
            "User attempted to access without valid service token: %j",
            serviceToken
        );
        return res
            .status(400)
            .sendFile(join(__dirname, "..", "pages", "error", "pc_en.html"));
    }

    const pidFromHeader = parseInt(
        String(req.headers["x-nintendo-current-principal-id"]),
        16
    ).toString();
    const pidFromToken = serviceToken.pid?.toString();

    if (pidFromHeader !== pidFromToken) {
        logger.warn(
            "User attempted to access with mismatched PIDs: header=%s, token=%s",
            pidFromHeader,
            pidFromToken
        );
        return res
            .status(400)
            .sendFile(join(__dirname, "..", "pages", "error", "pc_en.html"));
    }

    if (
        serviceToken.pid.toString().length !== 10 ||
        (serviceToken.serial_number.length !== 11 &&
            serviceToken.serial_number.length !== 12) ||
        serviceToken.access_key.length !== 17
    ) {
        logger.warn(
            "User attempted to access with invalid service token 2: %j",
            serviceToken
        );
        return res
            .status(400)
            .sendFile(join(__dirname, "..", "pages", "error", "pc_en.html"));
    }

    const pid = serviceToken.pid.toString();
    const accessKey = serviceToken.access_key;

    const getWhitelistEnv = async (): Promise<"dev" | "stg" | null> => {
        const row = await db("whitelist")
            .where("pid", pid)
            .andWhere("access_key", accessKey)
            .first();
        return row?.env ?? null;
    };

    const whitelistEnv = await getWhitelistEnv();

    if (!whitelistEnv) {
        logger.info(
            "User is not whitelist for any env, logging to admin panel."
        );

        logger.info(
            "Making admin panel request with pid: %s, accessKey: %s",
            pid,
            accessKey
        );
        try {
            const response = await fetch(
                "http://rose-tvii-admin:8080/api/v1/account/notWhitelisted",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-secret-key":
                            "y8FVEwHBTdRd7yfsWV/YP22ycycDmt0FoJsBwAApyvtYeKsjf9Zq6CrC7y2e5jyZVnWz5bbg4u4njSWebfP74g==",
                    },
                    body: JSON.stringify({
                        pid,
                        accessKey,
                    }),
                }
            );
            const data = await response.json();
            console.log(data);
        } catch (e: unknown) {
            logger.error(
                "Failed to parse admin panel response: %s",
                e instanceof Error ? e.message : String(e)
            );
        }
    }

    const user = await db("account").where("pid", pid).first();
    let accountEnv = user?.env ?? "prod";

    if (!whitelistEnv) {
        accountEnv = "prod";
    } else if (!user) {
        // if user has no account but has whitelist entry, use the whitelist environment
        accountEnv = whitelistEnv;
        logger.info(
            "User %s has no account but has whitelist entry for %s env",
            pid,
            whitelistEnv
        );
    } else if (whitelistEnv === "stg" && accountEnv === "dev") {
        accountEnv = "prod";
    }

    if (accountEnv !== user?.env) {
        await db("account").where("pid", pid).update({ env: accountEnv });
        logger.info(
            "Updated user %s env from %s to %s",
            pid,
            user?.env,
            accountEnv
        );
    }

    if (accountEnv === "dev") {
        logger.info("sending user %s to dev env", pid);
        return res.redirect(
            "https://tvii-dev.d1.us.vino.wup.app.projectrose.cafe"
        );
    } else if (accountEnv === "stg") {
        logger.info("sending user %s to stg env", pid);
        return res.redirect(
            "https://tvii-stg.l1.us.vino.wup.app.projectrose.cafe"
        );
    } else {
        logger.info("sending user %s to prod env", pid);
        return res.redirect(
            "https://tvii-prod.l1.us.vino.wup.app.projectrose.cafe"
        );
    }
});

app.listen(8080, () => {});
