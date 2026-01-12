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
  return (
    <div className='panel panel--simulation'>
      <div className='panel__header'>
        <div>
          <h2>Simulacija ogrevanja</h2>
          <p>Model izracuna odziv sistema na tvoje nastavitve in napoved.</p>
        </div>
        <div className='panel__meta'>
          <span className='tag tag--success'>
            Aktivno: {hvacStateLabel}
          </span>
          <span className='tag'>Ucinkovitost: {efficiencyLabel}</span>
        </div>
      </div>
      <div className='sim-grid'>
        <div className='sim-card'>
          <span>Notranja temperatura</span>
          <strong>{indoorTempLabel}</strong>
          <p>Cilj {comfortTempLabel}</p>
        </div>
        <div className='sim-card'>
          <span>Notranja vlaznost</span>
          <strong>{indoorHumidityLabel}%</strong>
          <p>Cilj {comfortHumidityLabel}%</p>
        </div>
        <div className='sim-card'>
          <span>Poraba energije</span>
          <strong>{powerLabel} kW</strong>
          <p>Prihranek {savingsPct}%</p>
        </div>
      </div>
      <div className='sim-footer'>
        <div>
          <p>Priporocen nacin</p>
          <strong>{recommendedMode}</strong>
        </div>
        <div>
          <p>Naslednja sprememba urnika</p>
          <strong>{nextChange}</strong>
        </div>
        <div className='sim-footer__chip'>{isAway ? "Odsoten" : "Doma"}</div>
      </div>
    </div>
  );
}
