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
  const tagBase =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.72rem] uppercase tracking-[0.08em]";
  const ghostButton =
    "rounded-full border border-[rgba(36,34,30,0.2)] px-[18px] py-[10px] text-[0.95rem] text-text transition hover:bg-[rgba(31,26,22,0.06)]";

  return (
    <div className='col-span-7 rounded-[24px] bg-white/85 p-6 shadow-soft backdrop-blur-[8px] max-[1024px]:col-span-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h2 className='font-display text-[1.3rem]'>Vremenska napoved</h2>
          <p className='text-[0.95rem] text-muted'>
            OpenWeatherMap podatki za izbrano lokacijo.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span
            className={`${tagBase} ${
              usingDemo
                ? "bg-[rgba(240,185,76,0.2)] text-[#9b5e0b] border-[rgba(240,185,76,0.35)]"
                : "bg-[rgba(67,177,126,0.2)] text-[#2f7a55] border-[rgba(67,177,126,0.35)]"
            }`}
          >
            {usingDemo ? "Demo podatki" : "Povezano"}
          </span>
          {lastUpdated && (
            <span
              className={`${tagBase} bg-[rgba(31,26,22,0.08)] text-[#3f352d] border-[rgba(31,26,22,0.12)]`}
            >
              Posodobljeno {lastUpdated}
            </span>
          )}
        </div>
      </div>

      <div className='mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 max-[720px]:grid-cols-1'>
        <label className='grid gap-2 text-[0.9rem] text-muted'>
          Lokacija
          <input
            type='text'
            value={cityInput}
            onChange={(event) => onCityInputChange(event.target.value)}
            placeholder='Mesto, drzava'
            className='rounded-[12px] border border-[rgba(36,34,30,0.2)] bg-[#fffaf5] px-3 py-2.5 text-[0.95rem] text-text'
          />
        </label>
        <button className={ghostButton} onClick={onRefresh}>
          Osvezi
        </button>
      </div>

      {weatherError && (
        <div className='mt-3 rounded-[12px] border border-[rgba(217,90,70,0.2)] bg-[rgba(217,90,70,0.12)] px-3.5 py-2.5 text-[0.9rem] text-[#b04a39]'>
          {weatherError}
        </div>
      )}

      <div className='mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[rgba(36,34,30,0.08)] bg-white/60 p-4 max-[720px]:items-start'>
        <div className='flex items-center gap-3'>
          <img
            className='h-14 w-14'
            src={`https://openweathermap.org/img/wn/${weatherNow.icon}@2x.png`}
            alt={weatherNow.description}
          />
          <div>
            <h3 className='text-[1.05rem]'>{weatherNow.city}</h3>
            <p className='mt-1.5 text-[0.9rem] text-muted'>
              {weatherNow.description}
            </p>
          </div>
        </div>
        <div className='grid grid-cols-4 gap-3 max-[720px]:grid-cols-2'>
          <div className='grid min-w-[90px] gap-1 text-right'>
            <span className='text-[0.8rem] text-muted'>Temperatura</span>
            <strong className='text-[1.05rem]'>
              {formatTempRounded(weatherNow.temp)}
            </strong>
          </div>
          <div className='grid min-w-[90px] gap-1 text-right'>
            <span className='text-[0.8rem] text-muted'>Obcutek</span>
            <strong className='text-[1.05rem]'>
              {formatTempRounded(weatherNow.feels)}
            </strong>
          </div>
          <div className='grid min-w-[90px] gap-1 text-right'>
            <span className='text-[0.8rem] text-muted'>Vlaznost</span>
            <strong className='text-[1.05rem]'>
              {Math.round(weatherNow.humidity)}%
            </strong>
          </div>
          <div className='grid min-w-[90px] gap-1 text-right'>
            <span className='text-[0.8rem] text-muted'>Veter</span>
            <strong className='text-[1.05rem]'>
              {roundOne(weatherNow.wind)} m/s
            </strong>
          </div>
        </div>
      </div>

      <div className='mt-[18px] grid gap-4'>
        {forecast.map((item) => (
          <div
            key={item.dateKey}
            className='flex items-center justify-between gap-4 rounded-[16px] border border-[rgba(36,34,30,0.08)] bg-white/60 p-4 max-[720px]:flex-col max-[720px]:items-start'
          >
            <div className='flex items-center gap-3'>
              <img
                className='h-11 w-11'
                src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                alt={item.description}
              />
              <div>
                <h3 className='text-[1.05rem]'>{item.label}</h3>
                <p className='mt-2 text-[0.9rem] text-muted'>
                  {item.description}
                </p>
              </div>
            </div>
            <div className='text-right max-[720px]:text-left'>
              <strong className='block text-[1.5rem]'>
                {formatTempRounded(item.temp)}
              </strong>
              <span className='text-[0.85rem] text-muted'>
                Obcutek {formatTempRounded(item.feels)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className='mt-[18px] rounded-[16px] bg-[#1f1a16] p-4 text-[#fef2e8]'>
        {forecastHint}
      </div>
    </div>
  );
}
