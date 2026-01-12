type TopbarProps = {
  autoEco: boolean;
  statusClass: string;
  statusLabel: string;
};

export default function Topbar({
  autoEco,
  statusClass,
  statusLabel,
}: TopbarProps) {
  return (
    <header className='topbar'>
      <div className='brand'>
        <div className='brand__mark'>SH</div>
        <div>
          <p className='brand__name'>SmartHeat</p>
          <p className='brand__tag'>pametno ogrevanje</p>
        </div>
      </div>
      <div className='status'>
        <span className={statusClass} />
        {statusLabel}
      </div>
      <button className='ghost'>
        {autoEco ? "Samodejni eko" : "Rocni nacin"}
      </button>
    </header>
  );
}
