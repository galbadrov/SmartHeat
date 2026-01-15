import type { Mode } from "../types";

type SimulationPanelProps = {
  hvacStateLabel: string;
  efficiencyLabel: string;
  indoorTempLabel: string;
  indoorHumidityLabel: number;
  comfortTempLabel: string;
  comfortHumidityLabel: number;
  powerLabel: string;
  savingsPct: number;
  recommendedMode: Mode;
  nextChange: string;
  isAway: boolean;
};

export default function SimulationPanel({
  hvacStateLabel,
  efficiencyLabel,
  indoorTempLabel,
  indoorHumidityLabel,
  comfortTempLabel,
  comfortHumidityLabel,
  powerLabel,
  savingsPct,
  recommendedMode,
  nextChange,
  isAway,
}: SimulationPanelProps) {
  const tagBase =
    "inline-flex items-center gap-1.5 rounded-full border border-[rgba(31,26,22,0.12)] bg-[rgba(31,26,22,0.08)] px-3 py-1 text-[0.72rem] uppercase tracking-[0.08em] text-[#3f352d]";

  return (
    <div className='col-span-8 rounded-[24px] bg-white/85 p-6 shadow-soft backdrop-blur-[8px] max-[1024px]:col-span-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h2 className='font-display text-[1.3rem]'>Simulacija ogrevanja</h2>
          <p className='text-[0.95rem] text-muted'>
            Model izracuna odziv sistema na tvoje nastavitve in napoved.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='inline-flex items-center gap-1.5 rounded-full border border-[rgba(67,177,126,0.35)] bg-[rgba(67,177,126,0.2)] px-3 py-1 text-[0.72rem] uppercase tracking-[0.08em] text-[#2f7a55]'>
            Aktivno: {hvacStateLabel}
          </span>
          <span className={tagBase}>Ucinkovitost: {efficiencyLabel}</span>
        </div>
      </div>
      <div className='mt-[18px] grid grid-cols-3 gap-3 max-[720px]:grid-cols-1'>
        <div className='rounded-[18px] border border-[rgba(36,34,30,0.08)] bg-white/60 p-4'>
          <span className='text-[0.85rem] text-muted'>Notranja temperatura</span>
          <strong className='my-2 block text-[1.3rem]'>{indoorTempLabel}</strong>
          <p className='text-[0.85rem] text-muted'>Cilj {comfortTempLabel}</p>
        </div>
        <div className='rounded-[18px] border border-[rgba(36,34,30,0.08)] bg-white/60 p-4'>
          <span className='text-[0.85rem] text-muted'>Notranja vlaznost</span>
          <strong className='my-2 block text-[1.3rem]'>
            {indoorHumidityLabel}%
          </strong>
          <p className='text-[0.85rem] text-muted'>
            Cilj {comfortHumidityLabel}%
          </p>
        </div>
        <div className='rounded-[18px] border border-[rgba(36,34,30,0.08)] bg-white/60 p-4'>
          <span className='text-[0.85rem] text-muted'>Poraba energije</span>
          <strong className='my-2 block text-[1.3rem]'>
            {powerLabel} kW
          </strong>
          <p className='text-[0.85rem] text-muted'>Prihranek {savingsPct}%</p>
        </div>
      </div>
      <div className='mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] bg-[#1f1a16] p-4 text-[#fef2e8] max-[720px]:flex-col max-[720px]:items-start'>
        <div>
          <p className='text-[0.85rem] opacity-70'>Priporocen nacin</p>
          <strong className='mt-1.5 block text-[1.05rem]'>
            {recommendedMode}
          </strong>
        </div>
        <div>
          <p className='text-[0.85rem] opacity-70'>Naslednja sprememba urnika</p>
          <strong className='mt-1.5 block text-[1.05rem]'>
            {nextChange}
          </strong>
        </div>
        <div className='rounded-full bg-white/20 px-3.5 py-1.5 text-[0.75rem] uppercase tracking-[0.12em]'>
          {isAway ? "Odsoten" : "Doma"}
        </div>
      </div>
    </div>
  );
}
