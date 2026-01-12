type HeroProps = {
  savingsPct: number;
  autoEco: boolean;
  isAway: boolean;
  comfortTempLabel: string;
  comfortHumidityLabel: number;
  indoorTempLabel: string;
  indoorHumidityLabel: number;
  outsideTempLabel: string;
  outsideHumidityLabel: number;
};

export default function Hero({
  savingsPct,
  autoEco,
  isAway,
  comfortTempLabel,
  comfortHumidityLabel,
  indoorTempLabel,
  indoorHumidityLabel,
  outsideTempLabel,
  outsideHumidityLabel,
}: HeroProps) {
  return (
    <section className='hero'>
      <div className='hero__copy'>
        <p className='eyebrow'>Pametni termostat + vremenska napoved</p>
        <h1>Upravljaj toploto doma z najmanj energije.</h1>
        <p className='lead'>
          SmartHeat povezuje interno opremo z OpenWeatherMap napovedjo in
          samodejno prilagaja ogrevanje, hlajenje ali razvlazevanje. Vedno
          uposteva tvoj komfort.
        </p>
        <div className='hero__actions'>
          <button className='primary'>Zazeni optimizacijo</button>
          <button className='secondary'>Pregled sistema</button>
        </div>
      </div>
      <div className='hero__panel'>
        <div className='hero__metric'>
          <span>Prihranek energije</span>
          <strong>-{savingsPct}%</strong>
          <p>
            {autoEco
              ? "Samodejni profil aktiviran."
              : "Rocni nacin brez optimizacije."}
          </p>
        </div>
        <div className='hero__metric'>
          <span>Aktivni profil</span>
          <strong>{isAway ? "Odsoten" : "Doma"}</strong>
          <p>
            Cilj {comfortTempLabel} in {comfortHumidityLabel}% vlage.
          </p>
        </div>
        <div className='hero__metric'>
          <span>Notranja klima</span>
          <strong>
            {indoorTempLabel} / {indoorHumidityLabel}%
          </strong>
          <p>
            Zunaj {outsideTempLabel}, vlaznost {outsideHumidityLabel}%.
          </p>
        </div>
      </div>
    </section>
  );
}
