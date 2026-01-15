import http from "node:http";
import OpenAI from "openai";

const PORT = Number(process.env.THERMO_PORT) || 8081;
const TICK_MS = 1000;
const HYSTERESIS = 0.4;
const HEAT_RATE = 0.12;
const COOL_RATE = 0.12;
const DRY_RATE = 0.3;
const LEAK_RATE = 0.01;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const ELECTRICITY_CACHE_TTL_MS = 10 * 60 * 1000;
const ELECTRICITY_TIMEOUT_MS = 12000;

const MODES = new Set(["Ogrevanje", "Hlajenje", "Izklop", "Razvlazevanje"]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const roundOne = (value) => Math.round(value * 10) / 10;
const roundTwo = (value) => Math.round(value * 100) / 100;

const electricityCache = new Map();
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const state = {
  setpoint: 22,
  humiditySetpoint: 45,
  mode: "Ogrevanje",
  hvacState: "IDLE",
  currentTemp: 20.2,
  currentHumidity: 48,
  outsideTemp: 5,
  outsideHumidity: 70,
  duty: 0,
  lastUpdated: new Date().toISOString(),
};

const formatTemp = (value) => value.toFixed(1);
const formatDuty = (value) => value.toFixed(1);

const logHvacState = () => {
  if (state.hvacState === "IDLE") {
    console.log("[THERMO] IDLE (within hysteresis)");
    return;
  }

  console.log(
    `[THERMO] ${state.hvacState} (temp=${formatTemp(
      state.currentTemp
    )} -> target=${formatTemp(state.setpoint)}, outside=${formatTemp(
      state.outsideTemp
    )}, duty=${formatDuty(state.duty)})`
  );
};

const getCachedElectricity = (country) => {
  const cached = electricityCache.get(country);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    electricityCache.delete(country);
    return null;
  }
  return cached.data;
};

const setCachedElectricity = (country, data) => {
  electricityCache.set(country, {
    data,
    expiresAt: Date.now() + ELECTRICITY_CACHE_TTL_MS,
  });
};

const toMinutes = (value) => {
  if (typeof value !== "string") return 0;
  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

const toPriceNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeElectricityPricing = (input, fallbackCountry) => {
  if (!input || typeof input !== "object") return null;
  const data = input;
  const prices = Array.isArray(data.prices)
    ? data.prices
        .map((slot) => {
          if (!slot || typeof slot !== "object") return null;
          const from = typeof slot.from === "string" ? slot.from : "";
          const to = typeof slot.to === "string" ? slot.to : "";
          const price = toPriceNumber(slot.price);
          if (!from || !to || price === null) return null;
          return { from, to, price };
        })
        .filter(Boolean)
    : [];

  if (!prices.length) return null;

  prices.sort((a, b) => toMinutes(a.from) - toMinutes(b.from));

  return {
    country: typeof data.country === "string" ? data.country : fallbackCountry,
    currency: typeof data.currency === "string" ? data.currency : "EUR",
    unit: typeof data.unit === "string" ? data.unit : "kWh",
    timezone:
      typeof data.timezone === "string" ? data.timezone : "Europe/Ljubljana",
    prices,
    note: typeof data.note === "string" ? data.note : "",
  };
};

const buildElectricityPrompt = (country) => ({
  model: OPENAI_MODEL,
  temperature: 0.2,
  response_format: { type: "json_object" },
  input: `Return JSON only. Use ASCII. Provide a realistic time-of-use electricity price schedule for ${country}. If time-of-use is uncommon, return a single full-day rate. Use this JSON schema exactly: {"country":"","currency":"","unit":"kWh","timezone":"","prices":[{"from":"HH:MM","to":"HH:MM","price":0.0}],"note":""}. Use 24h time and decimal dots. Keep 4-6 price slots.`,
});

const getResponseText = (response) => {
  if (!response || typeof response !== "object") return "";
  if (typeof response.output_text === "string") return response.output_text;
  const output = Array.isArray(response.output) ? response.output : [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    if (!Array.isArray(item.content)) continue;
    const textPart = item.content.find(
      (part) => part && part.type === "output_text" && typeof part.text === "string"
    );
    if (textPart?.text) return textPart.text;
  }
  return "";
};

const computeHvacState = () => {
  if (state.mode === "Izklop") return "IDLE";

  if (state.mode === "Ogrevanje") {
    if (state.currentTemp <= state.setpoint - HYSTERESIS) return "HEATING";
    if (state.currentTemp >= state.setpoint + HYSTERESIS) return "IDLE";
    return state.hvacState === "HEATING" ? "HEATING" : "IDLE";
  }

  if (state.mode === "Hlajenje") {
    if (state.currentTemp >= state.setpoint + HYSTERESIS) return "COOLING";
    if (state.currentTemp <= state.setpoint - HYSTERESIS) return "IDLE";
    return state.hvacState === "COOLING" ? "COOLING" : "IDLE";
  }

  if (state.mode === "Razvlazevanje") {
    if (state.currentHumidity >= state.humiditySetpoint + 3) return "DRYING";
    if (state.currentHumidity <= state.humiditySetpoint - 2) return "IDLE";
    return state.hvacState === "DRYING" ? "DRYING" : "IDLE";
  }

  return "IDLE";
};

const tick = () => {
  const previousHvac = state.hvacState;
  state.hvacState = computeHvacState();

  if (state.hvacState !== previousHvac) {
    logHvacState();
  }

  const hvacActive = state.hvacState !== "IDLE";
  let duty = 0;
  const leak = (state.outsideTemp - state.currentTemp) * LEAK_RATE;
  const minNetDelta = 0.02;
  if (hvacActive) {
    const diff =
      state.hvacState === "DRYING"
        ? Math.max(0, state.currentHumidity - state.humiditySetpoint)
        : Math.abs(state.setpoint - state.currentTemp);
    const baseDuty = clamp(diff / 2, 0.3, 1);
    let minDuty = 0;
    if (state.hvacState === "HEATING") {
      const requiredDelta = Math.max(0, minNetDelta - leak);
      minDuty = requiredDelta / HEAT_RATE;
    } else if (state.hvacState === "COOLING") {
      const requiredDelta = Math.max(0, leak + minNetDelta);
      minDuty = requiredDelta / COOL_RATE;
    } else if (state.hvacState === "DRYING") {
      minDuty = baseDuty;
    }
    duty = Math.max(baseDuty, minDuty);
  }

  state.duty = roundOne(duty);

  let tempChange = leak;
  if (state.hvacState === "HEATING") {
    tempChange += HEAT_RATE * duty;
  } else if (state.hvacState === "COOLING") {
    tempChange -= COOL_RATE * duty;
  } else if (state.hvacState === "DRYING") {
    tempChange += HEAT_RATE * 0.2;
  }

  state.currentTemp = roundTwo(state.currentTemp + tempChange);

  let humidityChange = (state.outsideHumidity - state.currentHumidity) * 0.01;
  if (state.hvacState === "DRYING") {
    humidityChange -= DRY_RATE;
  } else if (state.hvacState === "HEATING") {
    humidityChange -= 0.05;
  }

  state.currentHumidity = Math.round(
    clamp(state.currentHumidity + humidityChange, 20, 70)
  );
  state.lastUpdated = new Date().toISOString();
};

const setCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
};

const readJson = (req) =>
  new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/state") {
    sendJson(res, 200, state);
    return;
  }

  if (req.method === "GET" && url.pathname === "/electricity") {
    const country = url.searchParams.get("country")?.trim() || "Slovenija";
    const cached = getCachedElectricity(country);
    if (cached) {
      sendJson(res, 200, cached);
      return;
    }

    if (!OPENAI_API_KEY || !openai) {
      sendJson(res, 400, { error: "OPENAI_API_KEY ni nastavljen." });
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ELECTRICITY_TIMEOUT_MS);
      let response;
      try {
        response = await openai.responses.create(
          buildElectricityPrompt(country),
          { signal: controller.signal }
        );
      } finally {
        clearTimeout(timeout);
      }

      const content = getResponseText(response);
      if (!content) {
        throw new Error("Missing OpenAI content");
      }

      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        throw new Error("Invalid OpenAI JSON");
      }

      const normalized = normalizeElectricityPricing(parsed, country);
      if (!normalized) {
        throw new Error("Invalid electricity pricing format");
      }

      setCachedElectricity(country, normalized);
      sendJson(res, 200, normalized);
    } catch (error) {
      console.warn("[THERMO] Electricity price fetch failed.", error);
      sendJson(res, 500, { error: "Neuspesno branje cen elektrike." });
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/command") {
    const payload = await readJson(req);
    const changes = [];

    if (typeof payload.setpoint === "number") {
      state.setpoint = clamp(payload.setpoint, 10, 30);
      changes.push(`setpoint=${formatTemp(state.setpoint)}`);
    }

    if (typeof payload.humiditySetpoint === "number") {
      state.humiditySetpoint = clamp(payload.humiditySetpoint, 30, 60);
      changes.push(`humidity=${state.humiditySetpoint}`);
    }

    if (typeof payload.mode === "string" && MODES.has(payload.mode)) {
      state.mode = payload.mode;
      changes.push(`mode=${payload.mode}`);
    }

    if (typeof payload.outsideTemp === "number") {
      state.outsideTemp = roundOne(payload.outsideTemp);
      changes.push(`outside=${formatTemp(state.outsideTemp)}`);
    }

    if (typeof payload.outsideHumidity === "number") {
      state.outsideHumidity = clamp(payload.outsideHumidity, 20, 95);
      changes.push(`outsideHumidity=${state.outsideHumidity}`);
    }

    if (changes.length) {
      console.log(`[THERMO] COMMAND (${changes.join(", ")})`);
    }

    sendJson(res, 200, state);
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`[THERMO] Simulator running at http://localhost:${PORT}`);
});

setInterval(tick, TICK_MS);
