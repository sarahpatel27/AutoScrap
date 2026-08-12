import StepHeading from './StepHeading';
import {
  labelClass,
  inputClass,
  regInputClass,
  primaryButtonClass,
  alertErrorClass,
} from './constants';

export default function Step0VehicleLookup({
  compact,
  data,
  update,
  findVehicle,
  loading,
  error,
}) {
  if (compact) {
    return (
      <form
        className="mx-auto w-full max-w-[620px] rounded-[20px] bg-white p-[22px] text-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.25)] sm:p-[30px]"
        onSubmit={findVehicle}
      >
        <h3 className="mb-3.5 text-[1.55rem]">Get an instant estimate</h3>

        <label className={labelClass}>
          Vehicle registration
          <input
            className={regInputClass}
            value={data.registration}
            onChange={(event) =>
              update(
                'registration',
                event.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''),
              )
            }
            placeholder="AB12 CDE"
            autoComplete="off"
            maxLength={10}
          />
        </label>

        <label className={labelClass}>
          Collection postcode
          <input
            className={inputClass}
            value={data.postcode}
            onChange={(event) =>
              update(
                'postcode',
                event.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''),
              )
            }
            placeholder="SW1A 1AA"
            autoComplete="postal-code"
            maxLength={10}
          />
        </label>

        {error && <div className={alertErrorClass}>{error}</div>}

        <button
          type="submit"
          className={`${primaryButtonClass} w-full`}
          disabled={loading}
        >
          {loading ? 'Finding vehicle…' : 'Get My Quote'}
        </button>

        <small className="mt-2.5 block text-center text-slate-500">
          No obligation. Your details are handled securely.
        </small>
      </form>
    );
  }

  return (
    <form onSubmit={findVehicle}>
      <StepHeading number="1" title="Find your vehicle">
        Enter your registration and collection postcode.
      </StepHeading>

      <div className="grid gap-x-[18px] sm:grid-cols-2">
        <label className={labelClass}>
          Vehicle registration
          <input
            className={regInputClass}
            value={data.registration}
            onChange={(event) =>
              update(
                'registration',
                event.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''),
              )
            }
            placeholder="AB12 CDE"
            autoComplete="off"
            maxLength={10}
          />
        </label>

        <label className={labelClass}>
          Collection postcode
          <input
            className={inputClass}
            value={data.postcode}
            onChange={(event) =>
              update(
                'postcode',
                event.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''),
              )
            }
            placeholder="SW1A 1AA"
            autoComplete="postal-code"
            maxLength={10}
          />
        </label>
      </div>

      {error && <div className={alertErrorClass}>{error}</div>}

      <button
        type="submit"
        className={primaryButtonClass}
        disabled={loading}
      >
        {loading ? 'Searching…' : 'Find My Vehicle'}
      </button>
    </form>
  );
}
