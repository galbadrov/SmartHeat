type SchedulePanelProps = {
  awayTime: string;
  returnTime: string;
  autoEco: boolean;
  isAway: boolean;
  onAwayTimeChange: (value: string) => void;
  onReturnTimeChange: (value: string) => void;
  onToggleAutoEco: () => void;
};

export default function SchedulePanel({
  awayTime,
  returnTime,
  autoEco,
  isAway,
  onAwayTimeChange,
  onReturnTimeChange,
  onToggleAutoEco,
}: SchedulePanelProps) {
  const tagBase =
    "inline-flex items-center gap-1.5 rounded-full border border-[rgba(31,26,22,0.12)] bg-[rgba(31,26,22,0.08)] px-3 py-1 text-[0.72rem] uppercase tracking-[0.08em] text-[#3f352d]";
  const toggleButton =
    "rounded-full border border-[rgba(36,34,30,0.2)] px-[18px] py-[10px] text-[0.95rem] text-text transition hover:bg-[rgba(31,26,22,0.06)]";

  return (
    <div className='col-span-4 rounded-[24px] bg-white/85 p-6 shadow-soft backdrop-blur-[8px] max-[1024px]:col-span-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h2 className='font-display text-[1.3rem]'>Urnik prisotnosti</h2>
          <p className='text-[0.95rem] text-muted'>
            Odhod in prihod dolocata varcevanje.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className={tagBase}>
            {isAway ? "Trenutno odsoten" : "Trenutno doma"}
          </span>
        </div>
      </div>
      <div className='mt-[18px] grid gap-4'>
        <label className='grid gap-2 text-[0.9rem] text-muted'>
          Odhod iz doma
          <input
            type='time'
            value={awayTime}
            onChange={(event) => onAwayTimeChange(event.target.value)}
            className='rounded-[12px] border border-[rgba(36,34,30,0.2)] bg-[#fffaf5] px-3 py-2.5 text-[0.95rem] text-text'
          />
        </label>
        <label className='grid gap-2 text-[0.9rem] text-muted'>
          Prihod domov
          <input
            type='time'
            value={returnTime}
            onChange={(event) => onReturnTimeChange(event.target.value)}
            className='rounded-[12px] border border-[rgba(36,34,30,0.2)] bg-[#fffaf5] px-3 py-2.5 text-[0.95rem] text-text'
          />
        </label>
        <div className='flex items-center justify-between gap-3 rounded-full border border-[rgba(36,34,30,0.16)] bg-white/70 px-3.5 py-2.5'>
          <span className='text-[0.9rem] text-muted'>Nacin delovanja</span>
          <button
            type='button'
            aria-pressed={autoEco}
            onClick={onToggleAutoEco}
            className={toggleButton}
          >
            {autoEco ? "Samodejni eko" : "Rocni nacin"}
          </button>
        </div>
      </div>
    </div>
  );
}
