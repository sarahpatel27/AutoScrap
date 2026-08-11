import { useState } from 'react';
import { Link } from 'react-router';

const eyebrowClass =
    'mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f7b4f]';
const primaryButtonClass =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white shadow-[0_10px_25px_rgba(15,123,79,0.23)] transition hover:-translate-y-0.5 hover:bg-[#075b3a] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';

export default function PostcodeCheckerForm() {
    const [postcode, setPostcode] = useState('');
    const [result, setResult] = useState('');
    const [resultType, setResultType] = useState('');

    const checkPostcode = (event) => {
        event.preventDefault();

        const cleanedPostcode = postcode.trim();

        if (!cleanedPostcode) {
            setResult('Please enter your collection postcode.');
            setResultType('error');
            return;
        }

        if (cleanedPostcode.length < 5) {
            setResult('Please enter a valid UK postcode.');
            setResultType('error');
            return;
        }

        setResult(
            `Great news! We may be able to collect a vehicle from ${cleanedPostcode}. Request a quote to confirm availability.`,
        );
        setResultType('success');
    };

    return (
        <form
            className="w-full max-w-[650px] rounded-[22px] bg-white p-[22px] text-gray-900 shadow-[0_24px_60px_rgba(0,0,0,0.2)] sm:p-[30px]"
            onSubmit={checkPostcode}
        >
            <span className={eyebrowClass}>Check your area</span>

            <h2 className="my-2 text-[clamp(30px,4vw,44px)]">
                Search by postcode
            </h2>

            <p className="mb-5 leading-[1.6] text-gray-500">
                Enter your vehicle collection postcode to check whether our
                collection network may cover your area.
            </p>

            <label
                className="mb-2 block font-bold"
                htmlFor="coverage-postcode"
            >
                Collection postcode
            </label>

            <div className="flex flex-col gap-2.5 sm:flex-row">
                <input
                    className="min-w-0 flex-1 rounded-[10px] border border-gray-300 px-4 py-3.5 text-base uppercase outline-none focus:border-[#0f7b4f] focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]"
                    id="coverage-postcode"
                    type="text"
                    value={postcode}
                    onChange={(event) => {
                        setPostcode(event.target.value.toUpperCase());
                        setResult('');
                        setResultType('');
                    }}
                    placeholder="SW1A 1AA"
                    autoComplete="postal-code"
                />

                <button
                    className={`${primaryButtonClass} w-full sm:w-auto`}
                    type="submit"
                >
                    Check Coverage
                </button>
            </div>

            {result && (
                <div
                    className={`mt-3.5 rounded-[10px] px-[15px] py-[13px] leading-normal ${
                        resultType === 'success'
                            ? 'border border-[#c9e8d8] bg-[#edf7f2] text-[#175c40]'
                            : 'border border-red-200 bg-red-50 text-red-800'
                    }`}
                >
                    {result}
                </div>
            )}

            {resultType === 'success' && (
                <Link
                    className={`${primaryButtonClass} mt-3.5 w-full`}
                    to={`/quote?postcode=${encodeURIComponent(postcode.trim())}`}
                >
                    Get a Quote for {postcode.trim()}
                </Link>
            )}
        </form>
    );
}
