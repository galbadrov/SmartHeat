import type { ForecastDay, WeatherNow } from "../types";

type ForecastPanelProps = {
  usingDemo: boolean;
  lastUpdated: string | null;
  cityInput: string;
  onCityInputChange: (value: string) => void;
  onRefresh: () => void;
  weatherError: string;
  weatherNow: WeatherNow;
  forecast: ForecastDay[];
  forecastHint: string;
  formatTempRounded: (value: number) => string;
  roundOne: (value: number) => number;
};

export default function ForecastPanel({
  usingDemo,
  lastUpdated,
  cityInput,
  onCityInputChange,
  onRefresh,
  weatherError,
  weatherNow,
  forecast,
  forecastHint,
  formatTempRounded,
  roundOne,
}: ForecastPanelProps) {
  return (
    <div className='panel panel--forecast'>
      <div className='panel__header'>
        <div>
          <h2>Vremenska napoved</h2>
          <p>OpenWeatherMap podatki za izbrano lokacijo.</p>
        </div>
        <div className='panel__meta'>
          <span className={usingDemo ? "tag tag--warn" : "tag tag--success"}>
            {usingDemo ? "Demo podatki" : "Povezano"}
          </span>
          {lastUpdated && <span className='tag'>Posodobljeno {lastUpdated}</span>}
        </div>
      </div>

      <div className='weather-controls'>
        <label>
          Lokacija
          <input
            type='text'
            value={cityInput}
            onChange={(event) => onCityInputChange(event.target.value)}
            placeholder='Mesto, drzava'
          />
        </label>
        <button className='ghost' onClick={onRefresh}>
          Osvezi
        </button>
      </div>

      {weatherError && <div className='weather-error'>{weatherError}</div>}

      <div className='weather-now'>
        <div className='weather-now__main'>
          <img
            className='weather-icon'
            src={`https://openweathermap.org/img/wn/${weatherNow.icon}@2x.png`}
            alt={weatherNow.description}
          />
          <div>
            <h3>{weatherNow.city}</h3>
            <p>{weatherNow.description}</p>
          </div>
        </div>
        <div className='weather-now__metrics'>
          <div className='weather-metric'>
            <span>Temperatura</span>
            <strong>{formatTempRounded(weatherNow.temp)}</strong>
          </div>
          <div className='weather-metric'>
            <span>Obcutek</span>
            <strong>{formatTempRounded(weatherNow.feels)}</strong>
          </div>
          <div className='weather-metric'>
            <span>Vlaznost</span>
            <strong>{Math.round(weatherNow.humidity)}%</strong>
          </div>
          <div className='weather-metric'>
            <span>Veter</span>
            <strong>{roundOne(weatherNow.wind)} m/s</strong>
          </div>
        </div>
      </div>

      <div className='forecast'>
        {forecast.map((item) => (
          <div key={item.dateKey} className='forecast__item'>
            <div className='forecast__main'>
              <img
                className='forecast__icon'
                src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                alt={item.description}
              />
              <div>
                <h3>{item.label}</h3>
                <p>{item.description}</p>
              </div>
            </div>
            <div className='forecast__temp'>
              <strong>{formatTempRounded(item.temp)}</strong>
              <span>Obcutek {formatTempRounded(item.feels)}</span>
            </div>
          </div>
        ))}
      </div>
      <div className='forecast__note'>{forecastHint}</div>
    </div>
  );
}
