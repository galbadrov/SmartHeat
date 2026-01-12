import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import ControlPanel from "./components/ControlPanel";
import ForecastPanel from "./components/ForecastPanel";
import Hero from "./components/Hero";
import SchedulePanel from "./components/SchedulePanel";
import SimulationPanel from "./components/SimulationPanel";
import Topbar from "./components/Topbar";
import type {
  ForecastDay,
  HvacState,
  Mode,
  ThermostatState,
  WeatherNow,
} from "./types";

const MODES: Mode[] = ["Ogrevanje", "Hlajenje", "Izklop", "Razvlazevanje"];
const SIMULATOR_URL =
  import.meta.env.VITE_THERMO_URL || "http://localhost:8081";
const HVAC_LABELS: Record<HvacState, Mode> = {
  HEATING: "Ogrevanje",
  COOLING: "Hlajenje",
  DRYING: "Razvlazevanje",
  IDLE: "Izklop",
};
const DEFAULT_THERMO_STATE: ThermostatState = {
  setpoint: 22,
  humiditySetpoint: 45,
  mode: "Izklop",
  hvacState: "IDLE",
  currentTemp: 21.4,
  currentHumidity: 44,
  outsideTemp: 6,
  outsideHumidity: 70,
  duty: 0,
  lastUpdated: new Date().toISOString(),
};

type ForecastApiItem = {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{ description: string; icon: string }>;
};

type ForecastApiResponse = {
  list: ForecastApiItem[];
};

type WeatherApiResponse = {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{ description: string; icon: string }>;
  wind?: {
    speed: number;
  };
  sys?: {
    country?: string;
  };
};

const DEMO_FORECAST: ForecastDay[] = [
  {
    dateKey: "demo-1",
    label: "Danes",
    temp: 7,
    feels: 4,
    humidity: 76,
    description: "Cloudy with light rain",
    icon: "10d",
  },
  {
    dateKey: "demo-2",
    label: "Jutri",
    temp: 9,
    feels: 6,
    humidity: 68,
    description: "Windy with late clearing",
    icon: "04d",
  },
  {
    dateKey: "demo-3",
    label: "Sobota",
    temp: 11,
    feels: 10,
    humidity: 60,
    description: "Sunny and dry",
    icon: "01d",
  },
];

const DEMO_WEATHER: WeatherNow = {
  temp: 6.5,
  feels: 3.8,
  humidity: 78,
  description: "Cloudy",
  icon: "04d",
  wind: 3.4,
  city: "Ljubljana",
};

const DAY_NAMES = [
  "Nedelja",
  "Ponedeljek",
  "Torek",
  "Sreda",
  "Cetrtek",
  "Petek",
  "Sobota",
];

const roundOne = (value: number) => Math.round(value * 10) / 10;
const roundTwo = (value: number) => Math.round(value * 100) / 100;

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const capitalize = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatTemp = (value: number) => `${roundOne(value)} C`;
const formatTempRounded = (value: number) => `${Math.round(value)} C`;

const getMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return hours * 60 + minutes;
};

const getScheduleState = (awayTime: string, returnTime: string, now: Date) => {
  const awayMinutes = getMinutes(awayTime);
  const returnMinutes = getMinutes(returnTime);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  if (awayMinutes === returnMinutes) {
    return { isAway: false, nextChange: returnTime };
  }

  const crossesMidnight = awayMinutes > returnMinutes;
  const isAway = crossesMidnight
    ? nowMinutes >= awayMinutes || nowMinutes < returnMinutes
    : nowMinutes >= awayMinutes && nowMinutes < returnMinutes;

  const nextChange = isAway ? returnTime : awayTime;
  return { isAway, nextChange };
};

const pickDailyForecast = (items: ForecastApiItem[]) => {
  const dailyMap = new Map<
    string,
    { item: ForecastApiItem; hourDiff: number; timestamp: number }
  >();

  items.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const dateKey = toDateKey(date);
    const hourDiff = Math.abs(12 - date.getHours());
    const existing = dailyMap.get(dateKey);

    if (!existing || hourDiff < existing.hourDiff) {
      dailyMap.set(dateKey, { item, hourDiff, timestamp: item.dt });
    }
  });

  const todayKey = toDateKey(new Date());
  const tomorrowKey = toDateKey(new Date(Date.now() + 24 * 60 * 60 * 1000));

  return Array.from(dailyMap.entries())
    .sort((a, b) => a[1].timestamp - b[1].timestamp)
    .slice(0, 3)
    .map(([dateKey, entry]) => {
      const date = new Date(entry.timestamp * 1000);
      const label =
        dateKey === todayKey
          ? "Danes"
          : dateKey === tomorrowKey
          ? "Jutri"
          : DAY_NAMES[date.getDay()];

      return {
        dateKey,
        label,
        temp: entry.item.main.temp,
        feels: entry.item.main.feels_like,
        humidity: entry.item.main.humidity,
        description: capitalize(
          entry.item.weather?.[0]?.description ?? "No data"
        ),
        icon: entry.item.weather?.[0]?.icon ?? "01d",
      };
    });
};

const getRecommendedMode = (
  indoorTemp: number,
  indoorHumidity: number,
  targetTemp: number,
  targetHumidity: number
): Mode => {
  if (indoorTemp < targetTemp - 0.4) return "Ogrevanje";
  if (indoorTemp > targetTemp + 0.4) return "Hlajenje";
  if (indoorHumidity > targetHumidity + 4) return "Razvlazevanje";
  return "Izklop";
};

function App() {
  const [targetTemp, setTargetTemp] = useState(22);
  const [targetHumidity, setTargetHumidity] = useState(45);
  const [manualMode, setManualMode] = useState<Mode>("Ogrevanje");
  const [awayTime, setAwayTime] = useState("08:30");
  const [returnTime, setReturnTime] = useState("16:30");
  const [autoEco, setAutoEco] = useState(true);

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || "";
  const defaultCity = import.meta.env.VITE_OPENWEATHER_CITY || "Ljubljana,SI";
  const [city, setCity] = useState(defaultCity);
  const [cityInput, setCityInput] = useState(defaultCity);
  const [forecast, setForecast] = useState<ForecastDay[]>(DEMO_FORECAST);
  const [weatherNow, setWeatherNow] = useState<WeatherNow>(DEMO_WEATHER);
  const [weatherStatus, setWeatherStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [weatherError, setWeatherError] = useState("");
  const [usingDemo, setUsingDemo] = useState(!apiKey);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const [thermoState, setThermoState] =
    useState<ThermostatState>(DEFAULT_THERMO_STATE);
  const [thermoStatus, setThermoStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const lastCommandRef = useRef("");

  const scheduleState = getScheduleState(awayTime, returnTime, new Date());
  const comfortTemp =
    autoEco && scheduleState.isAway ? Math.max(16, targetTemp - 3) : targetTemp;
  const comfortHumidity =
    autoEco && scheduleState.isAway
      ? Math.max(35, targetHumidity - 4)
      : targetHumidity;

  const outsideTemp =
    weatherNow?.temp ?? forecast[0]?.temp ?? thermoState.outsideTemp ?? 7;
  const outsideHumidity =
    weatherNow?.humidity ??
    forecast[0]?.humidity ??
    thermoState.outsideHumidity ??
    60;

  const statusLabel =
    thermoStatus === "error"
      ? "Simulator ni dosegljiv"
      : !apiKey
      ? "Manjka API kljuc"
      : weatherStatus === "loading" || thermoStatus === "loading"
      ? "Osvezevanje sistema"
      : weatherStatus === "error"
      ? "Napaka pri vremenu"
      : "Sistem povezan";

  const statusClass =
    thermoStatus === "error" || !apiKey || weatherStatus === "error"
      ? "status__dot status__dot--error"
      : weatherStatus === "loading" || thermoStatus === "loading"
      ? "status__dot status__dot--warn"
      : "status__dot";

  const forecastHint = useMemo(() => {
    if (!forecast.length) return "Napoved ni na voljo.";

    const warmerDay = forecast.find((item) => item.temp >= targetTemp + 1);
    if (warmerDay) {
      return `Topel dan (${warmerDay.label}) omogoca znizanje ogrevanja.`;
    }

    const colderDay = forecast.find((item) => item.temp <= targetTemp - 4);
    if (colderDay) {
      return `Hladen dan (${colderDay.label}) - priporoceno predogrevanje.`;
    }

    return "Napoved je stabilna - ohranjamo varcni profil.";
  }, [forecast, targetTemp]);

  const recommendedMode = getRecommendedMode(
    thermoState.currentTemp,
    thermoState.currentHumidity,
    comfortTemp,
    comfortHumidity
  );
  const activeMode = autoEco ? recommendedMode : manualMode;
  const hvacStateLabel = HVAC_LABELS[thermoState.hvacState];
  const efficiencyLabel =
    thermoState.duty < 0.3
      ? "nizka"
      : thermoState.duty < 0.7
      ? "srednja"
      : "visoka";
  const basePower = 2.2;
  const powerKw = roundTwo(basePower * thermoState.duty);
  const savingsPct = Math.max(
    0,
    Math.min(100, Math.round((1 - powerKw / basePower) * 100))
  );

  const comfortTempLabel = formatTempRounded(comfortTemp);
  const comfortHumidityLabel = Math.round(comfortHumidity);
  const outsideTempLabel = formatTempRounded(outsideTemp);
  const outsideHumidityLabel = Math.round(outsideHumidity);
  const targetTempLabel = formatTempRounded(targetTemp);
  const indoorTempLabel = formatTemp(thermoState.currentTemp);
  const indoorHumidityLabel = thermoState.currentHumidity;
  const powerLabel = powerKw.toFixed(2);

  useEffect(() => {
    if (!apiKey) {
      setWeatherStatus("error");
      setWeatherError("VITE_OPENWEATHER_API_KEY ni nastavljen.");
      setUsingDemo(true);
      return;
    }

    const trimmedCity = city.trim();
    if (!trimmedCity) {
      setWeatherStatus("error");
      setWeatherError("Vnesi veljavno lokacijo.");
      setUsingDemo(true);
      return;
    }

    const controller = new AbortController();
    const fetchWeather = async () => {
      setWeatherStatus("loading");
      setWeatherError("");

      try {
        const encodedCity = encodeURIComponent(trimmedCity);
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&units=metric&appid=${apiKey}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&units=metric&appid=${apiKey}`;

        const [weatherResponse, forecastResponse] = await Promise.all([
          fetch(weatherUrl, { signal: controller.signal }),
          fetch(forecastUrl, { signal: controller.signal }),
        ]);

        if (!weatherResponse.ok || !forecastResponse.ok) {
          throw new Error("Weather request failed");
        }

        const weatherData =
          (await weatherResponse.json()) as WeatherApiResponse;
        const forecastData =
          (await forecastResponse.json()) as ForecastApiResponse;
        const locationLabel = weatherData.sys?.country
          ? `${weatherData.name}, ${weatherData.sys.country}`
          : weatherData.name;

        setWeatherNow({
          temp: weatherData.main.temp,
          feels: weatherData.main.feels_like,
          humidity: weatherData.main.humidity,
          description: capitalize(
            weatherData.weather?.[0]?.description ?? "No data"
          ),
          icon: weatherData.weather?.[0]?.icon ?? "01d",
          wind: weatherData.wind?.speed ?? 0,
          city: locationLabel || trimmedCity,
        });

        const daily = pickDailyForecast(forecastData.list ?? []);
        if (daily.length) {
          setForecast(daily);
        } else {
          setForecast(DEMO_FORECAST);
        }

        setWeatherStatus("success");
        setUsingDemo(false);
        setLastUpdated(
          new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        setWeatherStatus("error");
        setWeatherError("Neuspesno branje vremenskih podatkov.");
        setUsingDemo(true);
      }
    };

    fetchWeather();
    return () => controller.abort();
  }, [apiKey, city, refreshIndex]);

  useEffect(() => {
    let active = true;
    let polling = false;

    const pollThermostat = async () => {
      if (polling) return;
      polling = true;
      setThermoStatus((prev) => (prev === "idle" ? "loading" : prev));

      try {
        const response = await fetch(`${SIMULATOR_URL}/state`);
        if (!response.ok) {
          throw new Error("Thermostat request failed");
        }
        const data = (await response.json()) as ThermostatState;
        if (!active) return;
        setThermoState(data);
        setThermoStatus("success");
      } catch {
        if (!active) return;
        setThermoStatus("error");
      } finally {
        polling = false;
      }
    };

    pollThermostat();
    const interval = setInterval(pollThermostat, 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const sendThermostatCommand = async (payload: {
      setpoint: number;
      humiditySetpoint: number;
      mode: Mode;
      outsideTemp: number;
      outsideHumidity: number;
    }) => {
      try {
        await fetch(`${SIMULATOR_URL}/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        setThermoStatus("error");
      }
    };

    const payload = {
      setpoint: comfortTemp,
      humiditySetpoint: comfortHumidity,
      mode: activeMode,
      outsideTemp,
      outsideHumidity,
    };
    const serialized = JSON.stringify(payload);
    if (serialized === lastCommandRef.current) return;
    lastCommandRef.current = serialized;
    sendThermostatCommand(payload);
  }, [comfortTemp, comfortHumidity, activeMode, outsideTemp, outsideHumidity]);

  const handleRefresh = () => {
    const trimmed = cityInput.trim();
    if (!trimmed) {
      const prompted = window
        .prompt("Vnesi lokacijo (mesto, drzava):", city)
        ?.trim();
      if (!prompted) {
        setWeatherError("Vnesi veljavno lokacijo.");
        return;
      }
      setCity(prompted);
      setCityInput(prompted);
      setRefreshIndex((prev) => prev + 1);
      return;
    }
    setCity(trimmed);
    setCityInput(trimmed);
    setRefreshIndex((prev) => prev + 1);
  };

  useEffect(() => {
    console.log("doblen key: ", apiKey);
  }, [apiKey]);

  return (
    <div className='app'>
      <Topbar
        autoEco={autoEco}
        statusClass={statusClass}
        statusLabel={statusLabel}
      />

      <main>
        <Hero
          savingsPct={savingsPct}
          autoEco={autoEco}
          isAway={scheduleState.isAway}
          comfortTempLabel={comfortTempLabel}
          comfortHumidityLabel={comfortHumidityLabel}
          indoorTempLabel={indoorTempLabel}
          indoorHumidityLabel={indoorHumidityLabel}
          outsideTempLabel={outsideTempLabel}
          outsideHumidityLabel={outsideHumidityLabel}
        />

        <section className='grid'>
          <ControlPanel
            targetTemp={targetTemp}
            targetTempLabel={targetTempLabel}
            targetHumidity={targetHumidity}
            manualMode={manualMode}
            modes={MODES}
            onTargetTempChange={(value) => setTargetTemp(value)}
            onTargetHumidityChange={(value) => setTargetHumidity(value)}
            onManualModeChange={(mode) => setManualMode(mode)}
          />

          <ForecastPanel
            usingDemo={usingDemo}
            lastUpdated={lastUpdated}
            cityInput={cityInput}
            onCityInputChange={(value) => setCityInput(value)}
            onRefresh={handleRefresh}
            weatherError={weatherError}
            weatherNow={weatherNow}
            forecast={forecast}
            forecastHint={forecastHint}
            formatTempRounded={formatTempRounded}
            roundOne={roundOne}
          />

          <SchedulePanel
            awayTime={awayTime}
            returnTime={returnTime}
            autoEco={autoEco}
            isAway={scheduleState.isAway}
            onAwayTimeChange={(value) => setAwayTime(value)}
            onReturnTimeChange={(value) => setReturnTime(value)}
            onAutoEcoChange={(value) => setAutoEco(value)}
          />

          <SimulationPanel
            hvacStateLabel={hvacStateLabel}
            efficiencyLabel={efficiencyLabel}
            indoorTempLabel={indoorTempLabel}
            indoorHumidityLabel={indoorHumidityLabel}
            comfortTempLabel={comfortTempLabel}
            comfortHumidityLabel={comfortHumidityLabel}
            powerLabel={powerLabel}
            savingsPct={savingsPct}
            recommendedMode={recommendedMode}
            nextChange={scheduleState.nextChange}
            isAway={scheduleState.isAway}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
