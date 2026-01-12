export type Mode = "Ogrevanje" | "Hlajenje" | "Izklop" | "Razvlazevanje";

export type WeatherNow = {
  temp: number;
  feels: number;
  humidity: number;
  description: string;
  icon: string;
  wind: number;
  city: string;
};

export type ForecastDay = {
  dateKey: string;
  label: string;
  temp: number;
  feels: number;
  humidity: number;
  description: string;
  icon: string;
};

export type HvacState = "HEATING" | "COOLING" | "DRYING" | "IDLE";

export type ThermostatState = {
  setpoint: number;
  humiditySetpoint: number;
  mode: Mode;
  hvacState: HvacState;
  currentTemp: number;
  currentHumidity: number;
  outsideTemp: number;
  outsideHumidity: number;
  duty: number;
  lastUpdated: string;
};
