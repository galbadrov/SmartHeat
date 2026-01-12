import type { Mode } from "../types";

type ControlPanelProps = {
  targetTemp: number;
  targetTempLabel: string;
  targetHumidity: number;
  manualMode: Mode;
  modes: readonly Mode[];
  onTargetTempChange: (value: number) => void;
  onTargetHumidityChange: (value: number) => void;
  onManualModeChange: (mode: Mode) => void;
};

export default function ControlPanel({
  targetTemp,
  targetTempLabel,
  targetHumidity,
  manualMode,
  modes,
  onTargetTempChange,
  onTargetHumidityChange,
  onManualModeChange,
}: ControlPanelProps) {
  return (
    <div className='panel panel--control'>
      <div className='panel__header'>
        <div>
          <h2>Zelje uporabnika</h2>
          <p>Nastavi cilj, ostalo optimizira sistem.</p>
        </div>
        <div className='panel__meta'>
          <span className='tag'>Cilj {targetTempLabel}</span>
        </div>
      </div>
      <div className='control'>
        <div className='control__row'>
          <label htmlFor='temp'>Optimalna temperatura</label>
          <span>{targetTempLabel}</span>
        </div>
        <input
          id='temp'
          type='range'
          min='18'
          max='26'
          value={targetTemp}
          onChange={(event) =>
            onTargetTempChange(Number(event.target.value))
          }
        />
      </div>
      <div className='control'>
        <div className='control__row'>
          <label htmlFor='humidity'>Optimalna vlaznost</label>
          <span>{targetHumidity}%</span>
        </div>
        <input
          id='humidity'
          type='range'
          min='35'
          max='60'
          value={targetHumidity}
          onChange={(event) =>
            onTargetHumidityChange(Number(event.target.value))
          }
        />
      </div>
      <div className='mode'>
        <p>Nacin delovanja (rocni izbor)</p>
        <div className='mode__group'>
          {modes.map((item) => (
            <button
              key={item}
              className={
                manualMode === item ? "mode__btn is-active" : "mode__btn"
              }
              onClick={() => onManualModeChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <p className='hint'>
          Ce je samodejni eko nacin vklopljen, sistem lahko prilagodi nacin.
        </p>
      </div>
    </div>
  );
}
