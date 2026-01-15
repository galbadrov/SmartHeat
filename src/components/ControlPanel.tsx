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
  const tagBase =
    "inline-flex items-center gap-1.5 rounded-full border border-[rgba(31,26,22,0.12)] bg-[rgba(31,26,22,0.08)] px-3 py-1 text-[0.72rem] uppercase tracking-[0.08em] text-[#3f352d]";
  const modeButtonBase =
    "rounded-full border border-[rgba(36,34,30,0.16)] px-3.5 py-2 text-[0.9rem] transition";
  const modeButtonActive = "bg-[#1f1a16] text-[#fff7f1] border-transparent";

  return (
    <div className='col-span-5 rounded-[24px] bg-white/85 p-6 shadow-soft backdrop-blur-[8px] max-[1024px]:col-span-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h2 className='font-display text-[1.3rem]'>Zelje uporabnika</h2>
          <p className='text-[0.95rem] text-muted'>
            Nastavi cilj, ostalo optimizira sistem.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className={tagBase}>Cilj {targetTempLabel}</span>
        </div>
      </div>
      <div className='mt-5 rounded-[18px] border border-[rgba(36,34,30,0.08)] bg-white/60 p-4'>
        <div className='mb-2.5 flex items-center justify-between text-[0.95rem]'>
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
          className='w-full accent-warm'
        />
      </div>
      <div className='mt-5 rounded-[18px] border border-[rgba(36,34,30,0.08)] bg-white/60 p-4'>
        <div className='mb-2.5 flex items-center justify-between text-[0.95rem]'>
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
          className='w-full accent-warm'
        />
      </div>
      <div className='mt-6'>
        <p className='mb-3 text-muted'>Nacin delovanja (rocni izbor)</p>
        <div className='flex flex-wrap gap-2.5'>
          {modes.map((item) => (
            <button
              key={item}
              className={`${modeButtonBase} ${
                manualMode === item ? modeButtonActive : "bg-transparent"
              }`}
              onClick={() => onManualModeChange(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <p className='mt-2.5 text-[0.85rem] text-muted'>
          Ce je samodejni eko nacin vklopljen, sistem lahko prilagodi nacin.
        </p>
      </div>
    </div>
  );
}
