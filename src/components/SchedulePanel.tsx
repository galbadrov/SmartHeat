type SchedulePanelProps = {
  awayTime: string;
  returnTime: string;
  autoEco: boolean;
  isAway: boolean;
  onAwayTimeChange: (value: string) => void;
  onReturnTimeChange: (value: string) => void;
  onAutoEcoChange: (value: boolean) => void;
};

export default function SchedulePanel({
  awayTime,
  returnTime,
  autoEco,
  isAway,
  onAwayTimeChange,
  onReturnTimeChange,
  onAutoEcoChange,
}: SchedulePanelProps) {
  return (
    <div className='panel panel--schedule'>
      <div className='panel__header'>
        <div>
          <h2>Urnik prisotnosti</h2>
          <p>Odhod in prihod dolocata varcevanje.</p>
        </div>
        <div className='panel__meta'>
          <span className='tag'>
            {isAway ? "Trenutno odsoten" : "Trenutno doma"}
          </span>
        </div>
      </div>
      <div className='schedule'>
        <label>
          Odhod iz doma
          <input
            type='time'
            value={awayTime}
            onChange={(event) => onAwayTimeChange(event.target.value)}
          />
        </label>
        <label>
          Prihod domov
          <input
            type='time'
            value={returnTime}
            onChange={(event) => onReturnTimeChange(event.target.value)}
          />
        </label>
        <label className='toggle'>
          <input
            type='checkbox'
            checked={autoEco}
            onChange={(event) => onAutoEcoChange(event.target.checked)}
          />
          <span>Samodejni eko nacin</span>
        </label>
      </div>
    </div>
  );
}
