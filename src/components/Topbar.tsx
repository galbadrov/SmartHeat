type TopbarProps = {
  autoEco: boolean;
  statusClass: string;
  statusLabel: string;
  onToggleAutoEco: () => void;
};

export default function Topbar({
  autoEco,
  statusClass,
  statusLabel,
  onToggleAutoEco,
}: TopbarProps) {
  return (
    <header className='relative z-10 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 max-[1024px]:grid-cols-1 max-[1024px]:justify-items-start'>
      <div className='flex items-center gap-4'>
        <div className='grid h-12 w-12 place-items-center rounded-[14px] bg-[linear-gradient(140deg,_#f6b07a,_#ed6f42)] font-display text-[0.95rem] font-bold tracking-[0.06em] text-ink'>
          SH
        </div>
        <div>
          <p className='font-display text-[1.2rem]'>SmartHeat</p>
          <p className='text-[0.85rem] uppercase tracking-[0.12em] text-muted'>
            pametno ogrevanje
          </p>
        </div>
      </div>
      <div className='flex items-center gap-2.5 rounded-full bg-white/60 px-3.5 py-2 text-[0.95rem] text-muted backdrop-blur-[6px]'>
        <span className={statusClass} />
        {statusLabel}
      </div>
      <button
        type='button'
        aria-pressed={autoEco}
        onClick={onToggleAutoEco}
        className='rounded-full border border-[rgba(36,34,30,0.2)] px-[18px] py-[10px] text-[0.95rem] text-text transition hover:bg-[rgba(31,26,22,0.06)]'
      >
        {autoEco ? "Samodejni eko" : "Rocni nacin"}
      </button>
    </header>
  );
}
