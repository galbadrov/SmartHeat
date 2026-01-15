import type { ElectricityPricing } from "../types";

type CountryOption = {
  code: string;
  label: string;
};

type ElectricityPanelProps = {
  countries: CountryOption[];
  selectedCountry: string;
  onCountryChange: (value: string) => void;
  pricing: ElectricityPricing | null;
  status: "idle" | "loading" | "success" | "error";
  error: string;
  usingDemo: boolean;
  lastUpdated: string | null;
};

export default function ElectricityPanel({
  countries,
  selectedCountry,
  onCountryChange,
  pricing,
  status,
  error,
  usingDemo,
  lastUpdated,
}: ElectricityPanelProps) {
  const tagBase =
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.72rem] uppercase tracking-[0.08em]";
  const statusTag = usingDemo
    ? "bg-[rgba(240,185,76,0.2)] text-[#9b5e0b] border-[rgba(240,185,76,0.35)]"
    : status === "loading"
    ? "bg-[rgba(240,185,76,0.2)] text-[#9b5e0b] border-[rgba(240,185,76,0.35)]"
    : status === "error"
    ? "bg-[rgba(217,90,70,0.2)] text-[#b04a39] border-[rgba(217,90,70,0.35)]"
    : "bg-[rgba(67,177,126,0.2)] text-[#2f7a55] border-[rgba(67,177,126,0.35)]";
  const statusLabel = usingDemo
    ? "Demo podatki"
    : status === "loading"
    ? "Pridobivam"
    : status === "error"
    ? "Napaka"
    : "Povezano";
  const currencyLabel = pricing ? `${pricing.currency}/${pricing.unit}` : "";

  return (
    <div className='col-span-12 rounded-[24px] bg-white/85 p-6 shadow-soft backdrop-blur-[8px] max-[1024px]:col-span-6'>
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h2 className='font-display text-[1.3rem]'>Cena elektrike</h2>
          <p className='text-[0.95rem] text-muted'>
            Ocena OpenAI glede na izbrano drzavo.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className={`${tagBase} ${statusTag}`}>{statusLabel}</span>
          {lastUpdated && (
            <span
              className={`${tagBase} bg-[rgba(31,26,22,0.08)] text-[#3f352d] border-[rgba(31,26,22,0.12)]`}
            >
              Posodobljeno {lastUpdated}
            </span>
          )}
        </div>
      </div>

      <div className='mt-4 grid gap-3'>
        <label className='grid gap-2 text-[0.9rem] text-muted'>
          Drzava
          <select
            value={selectedCountry}
            onChange={(event) => onCountryChange(event.target.value)}
            className='rounded-[12px] border border-[rgba(36,34,30,0.2)] bg-[#fffaf5] px-3 py-2.5 text-[0.95rem] text-text'
          >
            {countries.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className='mt-3 rounded-[12px] border border-[rgba(217,90,70,0.2)] bg-[rgba(217,90,70,0.12)] px-3.5 py-2.5 text-[0.9rem] text-[#b04a39]'>
          {error}
        </div>
      )}

      {pricing ? (
        <>
          <div className='mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[16px] border border-[rgba(36,34,30,0.08)] bg-white/60 p-4'>
            <div>
              <span className='text-[0.8rem] text-muted'>Valuta</span>
              <p className='text-[1rem]'>{currencyLabel}</p>
            </div>
            <div className='text-right'>
              <span className='text-[0.8rem] text-muted'>Casovni pas</span>
              <p className='text-[1rem]'>{pricing.timezone}</p>
            </div>
          </div>
          <div className='mt-4 grid gap-3'>
            {pricing.prices.map((slot) => (
              <div
                key={`${slot.from}-${slot.to}`}
                className='flex items-center justify-between gap-3 rounded-[16px] border border-[rgba(36,34,30,0.08)] bg-white/60 p-4'
              >
                <div>
                  <span className='text-[0.85rem] text-muted'>Obdobje</span>
                  <p className='text-[1rem]'>
                    {slot.from} - {slot.to}
                  </p>
                </div>
                <div className='text-right'>
                  <span className='text-[0.85rem] text-muted'>Cena</span>
                  <p className='text-[1.05rem]'>
                    {slot.price.toFixed(3)} {currencyLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
          {pricing.note && (
            <div className='mt-4 rounded-[16px] bg-[#1f1a16] p-4 text-[#fef2e8]'>
              {pricing.note}
            </div>
          )}
        </>
      ) : (
        <div className='mt-4 rounded-[16px] border border-[rgba(36,34,30,0.08)] bg-white/60 p-4 text-[0.9rem] text-muted'>
          Ni podatkov o ceni elektrike.
        </div>
      )}
    </div>
  );
}
