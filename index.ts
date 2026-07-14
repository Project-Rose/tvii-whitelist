import express, { type Request, type Response } from "express";
import path from "path";
import knex from "knex";
import { fileURLToPath } from "url";
import NodeCache from "node-cache";
import { env } from "./env.ts";

const miiCache = new NodeCache({
  stdTTL: 48 * 60 * 60, // 48 hours
  checkperiod: 60 * 60 // cleanup every hour
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 10066;

const db = knex({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    port: 3306,
    user: "rose",
    password: env.DB_PASSWORD,
    database: "tvii-prod-analytics"
  },
  pool: {
    min: 2,
    max: 10
  }
});

const db_whitelist = knex({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    port: 3306,
    user: "rose",
    password: env.DB_PASSWORD,
    database: "whitelist"
  },
  pool: {
    min: 2,
    max: 10
  }
});

function parseServiceToken(req: Request): {
  ok: boolean;
  pid: number | undefined;
  access_key: string | undefined;
  serial_number: string | undefined;
  version: string | undefined;
  country: string | undefined;
} {
  const rawHeader = req.headers["x-nintendo-service-token"];

  if (!rawHeader || typeof rawHeader !== "string") {
    return {
      ok: false,
      pid: undefined,
      serial_number: undefined,
      access_key: undefined,
      version: undefined,
      country: undefined,
    };
  }

  let decoded: string;

  try {
    const data = Buffer.from(rawHeader, "base64");
    const buf = Buffer.alloc(data.length);
    const secret = env.SERVICE_TOKEN_SECRET;

    for (let i = 0; i < data.length; i++) {
      buf[i] = data[i]! ^ secret.charCodeAt(i % secret.length);
    }

    decoded = buf.toString("utf8");
  } catch (e) {
    return {
      ok: false,
      pid: undefined,
      serial_number: undefined,
      access_key: undefined,
      version: undefined,
      country: undefined,
    };
  }

  console.log(decoded)

  const headerParts = decoded.split(",").map(p => p.trim());

  if (headerParts.length < 6) {
    return {
      ok: false,
      pid: undefined,
      serial_number: undefined,
      access_key: undefined,
      version: undefined,
      country: undefined,
    };
  }

  const pid = Number(headerParts[0]);
  const access_key = headerParts[1];
  const serial_number = `${headerParts[2]}${headerParts[3]}`; // combine third and fourth for serial
  const country = headerParts[4];
  const version = headerParts[5];

  return {
    ok: true,
    pid: isNaN(pid) ? undefined : pid,
    access_key,
    serial_number,
    country,
    version,
  };
}

app.set("view engine", "ejs");

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Root route serves index.html
app.get("/", async (req: Request, res: Response) => {
  const tokenHeader = req.headers["x-nintendo-service-token"];
  if (!tokenHeader || typeof tokenHeader !== "string") {
    return res.status(400).end();
  }

  const token = parseServiceToken(req);
  console.log("User tried to access!", token.pid!, token.country!);
  if (token.ok) {

    const check = await db_whitelist("access_allowlist").where({
      pid: token.pid
    }).first();
    console.log(check && check.env)

    if (check && check.env === "dev") {
      if (token.country == "US" || token.country == "CA") {
        return res.redirect("https://tvii-dev.d1.us.vino.wup.app.projectrose.cafe/");
      }
    } else if (check && check.env === "stg") {
      if (token.country == "US" || token.country == "CA") {
        return res.redirect("https://tvii-stg.l1.us.vino.wup.app.projectrose.cafe/");
      }
    } else {
      if (token.country == "US" || token.country == "CA") {
        return res.redirect("https://tvii-prod.l1.us.vino.wup.app.projectrose.cafe/");
      }
    }
  }
  return res.redirect("/not_available");
});

app.use(express.static(path.join(__dirname, "static")));

// Root route serves index.html
app.get("/not_available", async (req: Request, res: Response) => {
  const tokenHeader = req.headers["x-nintendo-service-token"];
  if (!tokenHeader || typeof tokenHeader !== "string") {
    return res.status(400).end();
  }

  const token = parseServiceToken(req);
  var has_latest_rose = token && token.ok && token.version == "v1.2.7";

  console.log("User was taken to default page, probably not US/CA or outdated", token.pid!, token.country!);

  res.render("index.ejs", {
    has_latest_rose
  });

});

// Root route serves index.html
app.get("/image_view", async (req: Request, res: Response) => {
  const tokenHeader = req.headers["x-nintendo-service-token"];
  if (!tokenHeader || typeof tokenHeader !== "string") {
    return res.status(400).end();
  }

  const token = parseServiceToken(req);
  const image_url = String(req.query.url);
  const els_id = String(req.query.els);
  
  res.render("image_viewer.ejs", {
    image_url,
    els_id
  });

});

app.get("/v1/rose/analytics/get", async (req: Request, res: Response) => {
  const tokenHeader = req.headers["x-nintendo-service-token"];
  const { type, pid, limit } = req.query;

  if (!tokenHeader || typeof tokenHeader !== "string") {
    return res.status(400).json({ error: "Missing X-Nintendo-Service-Token header" });
  }

  try {
    let query = db("entries").select("*");

    if (type === "friend") {
      const pidList = Array.isArray(pid)
        ? pid.map(String)
        : typeof pid === "string"
          ? [pid]
          : [];

      if (pidList.length === 0) {
        return res.json([]);
      }

      query = query.whereIn("pid", pidList);
    }

    else if (type === "all") {
      const safeLimit = Math.min(
        Math.max(Number(limit) || 100, 1),
        100
      );

      query = query.limit(safeLimit);
    }

    else {
      return res.status(400).json({ error: "Invalid type" });
    }

    const entries = await query.orderBy("create_time", "desc");

    // Only return mii_name, pid, prefers
    const simplified = entries.map(e => ({
      mii_name: e.mii_name,
      pid: e.pid,
      prefers: e.prefers
    }));

    return res.json(simplified);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/v1/rose/analytics/count", async (req: Request, res: Response) => {
  const tokenHeader = req.headers["x-nintendo-service-token"];

  if (!tokenHeader || typeof tokenHeader !== "string") {
    return res.status(400).json({ error: "Missing X-Nintendo-Service-Token header" });
  }

  try {
    const rows = await db("entries")
      .select("prefers")
      .count<{ prefers: string; count: number }[]>("* as count")
      .whereIn("prefers", ["miiverse", "tvii", "all"])
      .groupBy("prefers");

    // Normalize output so missing values return 0
    const result = {
      miiverse: 0,
      tvii: 0,
      all: 0
    };

    for (const row of rows) {
      result[row.prefers as "miiverse" | "tvii" | "all"] = Number(row.count);
    }

    return res.json(result);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/img/mii", async (req: Request, res: Response) => {
  try {
    const pid = req.query.pid;

    if (!pid || typeof pid !== "string") {
      return res.status(400).send("Missing pid");
    }

    const cached = miiCache.get<Buffer>(pid);
    if (cached) {
      res.setHeader("Content-Type", "image/png");
      return res.send(cached);
    }

    async function fetchMii(apiId: string): Promise<Buffer | null> {
      try {
        const url = new URL("https://mii-unsecure.ariankordi.net/miis/image.png");
        url.searchParams.set("pid", String(pid));
        url.searchParams.set("width", "90");
        url.searchParams.set("api_id", apiId);
        url.searchParams.set("forceRefresh", "1");

        const response = await fetch(url.toString());
        if (!response.ok) return null;

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch {
        return null;
      }
    }

    // First attempt: api_id = 1
    let buffer = await fetchMii("1");

    // Retry: api_id = 0
    if (!buffer) {
      buffer = await fetchMii("0");
    }

    // Final fallback: local placeholder
    if (!buffer) {
      return res.sendFile(
        path.join(__dirname, "static", "img", "mii-hidden.png")
      );
    }

    // Cache successful fetch
    miiCache.set(pid, buffer);

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error("Mii fetch error:", err);
    res.sendFile(
      path.join(__dirname, "static", "img", "mii-hidden.png")
    );
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
