import http from "node:http";

const PORT = Number(process.env.THERMO_PORT) || 8081;
const TICK_MS = 1000;
const HYSTERESIS = 0.4;
const HEAT_RATE = 0.12;
const COOL_RATE = 0.12;
const DRY_RATE = 0.3;
const LEAK_RATE = 0.01;

const MODES = new Set(["Ogrevanje", "Hlajenje", "Izklop", "Razvlazevanje"]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const roundOne = (value) => Math.round(value * 10) / 10;

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
  if (hvacActive) {
    const diff =
      state.hvacState === "DRYING"
        ? Math.max(0, state.currentHumidity - state.humiditySetpoint)
        : Math.abs(state.setpoint - state.currentTemp);
    duty = clamp(diff / 2, 0.3, 1);
  }

  state.duty = roundOne(duty);

  const leak = (state.outsideTemp - state.currentTemp) * LEAK_RATE;
  const minNetDelta = 0.02;
  let hvacDelta = 0;
  if (state.hvacState === "HEATING") {
    const baseHeat = HEAT_RATE * duty;
    hvacDelta = Math.max(baseHeat, Math.abs(leak) + minNetDelta);
  } else if (state.hvacState === "COOLING") {
    const baseCool = COOL_RATE * duty;
    hvacDelta = -Math.max(baseCool, Math.abs(leak) + minNetDelta);
  } else if (state.hvacState === "DRYING") {
    hvacDelta = HEAT_RATE * 0.2;
  }

  const tempChange = leak + hvacDelta;

  state.currentTemp = roundOne(state.currentTemp + tempChange);

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
