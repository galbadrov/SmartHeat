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
    <section className='relative z-10 mt-12 grid grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-9 max-[1024px]:grid-cols-1'>
      <div className='space-y-4'>
        <p className='text-[0.9rem] uppercase tracking-[0.18em] text-muted'>
          Pametni termostat + vremenska napoved
        </p>
        <h1 className='font-display text-[clamp(2.4rem,4vw,3.6rem)] leading-[1.05]'>
          Upravljaj toploto doma z najmanj energije.
        </h1>
        <p className='text-[1.05rem] text-muted'>
          SmartHeat povezuje interno opremo z OpenWeatherMap napovedjo in
          samodejno prilagaja ogrevanje, hlajenje ali razvlazevanje. Vedno
          uposteva tvoj komfort.
        </p>
        {/* <div className='flex flex-wrap gap-3 max-[720px]:flex-col max-[720px]:items-stretch'>
          <button className='rounded-full border border-transparent bg-[linear-gradient(120deg,_#f6b07a,_#ed6f42)] px-5 py-3 text-[0.98rem] text-[#1b120d] shadow-glow'>
            Zazeni optimizacijo
          </button>
          <button className='rounded-full border border-[rgba(36,34,30,0.2)] bg-white/70 px-5 py-3 text-[0.98rem] text-text'>
            Pregled sistema
          </button>
        </div> */}
      </div>
      <div className='grid gap-[18px]'>
        <div className='rounded-[22px] bg-white/70 p-[18px] shadow-soft backdrop-blur-[10px] opacity-0 animate-rise'>
          <span className='text-[0.9rem] text-muted'>Prihranek energije</span>
          <strong className='my-2 block text-[1.4rem]'>{savingsPct}%</strong>
          <p className='text-[0.9rem] text-muted'>
            {autoEco
              ? "Samodejni profil aktiviran."
              : "Rocni nacin brez optimizacije."}
          </p>
        </div>
        <div
          className='rounded-[22px] bg-white/70 p-[18px] shadow-soft backdrop-blur-[10px] opacity-0 animate-rise'
          style={{ animationDelay: "0.1s" }}>
          <span className='text-[0.9rem] text-muted'>Aktivni profil</span>
          <strong className='my-2 block text-[1.4rem]'>
            {isAway ? "Odsoten" : "Doma"}
          </strong>
          <p className='text-[0.9rem] text-muted'>
            Cilj {comfortTempLabel} in {comfortHumidityLabel}% vlage.
          </p>
        </div>
        <div
          className='rounded-[22px] bg-white/70 p-[18px] shadow-soft backdrop-blur-[10px] opacity-0 animate-rise'
          style={{ animationDelay: "0.2s" }}>
          <span className='text-[0.9rem] text-muted'>Notranja klima</span>
          <strong className='my-2 block text-[1.4rem]'>
            {indoorTempLabel} / {indoorHumidityLabel}%
          </strong>
          <p className='text-[0.9rem] text-muted'>
            Zunaj {outsideTempLabel}, vlaznost {outsideHumidityLabel}%.
          </p>
        </div>
      </div>
    </section>
  );
}
