export const initial = {
  registration: '',
  postcode: '',
  mileage: '',
  vehicle: null,

  condition: {
    isRunning: null,
    hasFourWheels: null,
    isComplete: null,
    hasCatalyticConverter: null,
  },

  customer: {
    fullName: '',
    phone: '',
    email: '',
    collectionPostcode: '',
    collectionAddress: '',
    preferredContact: 'phone',
    notes: '',
    privacy: false,
    terms: false,
  },

  bank: {
    accountName: '',
    sortCode: '',
    accountNumber: '',
    bankName: '',
  },

  quote: null,
  enquiry: null,
};

export const questions = [];

export const steps = [
  'Vehicle',
  'Estimated Quote',
  'Your details',
  'Success',
];

export const labelClass = 'mb-[15px] flex flex-col gap-[7px] text-sm font-bold';
export const inputClass =
  'rounded-[10px] border border-slate-200 bg-white px-3.5 py-[13px] outline-none focus:border-[#0f7b4f] focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]';
export const regInputClass = `rounded-[10px] border border-slate-200 px-3.5 py-[13px] outline-none focus:border-[#0f7b4f] focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)] border-[#d1aa16] bg-[#f8ce3d] font-mono font-black uppercase tracking-[0.13em] text-[#111]`;
export const primaryButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white shadow-[0_10px_25px_rgba(15,123,79,0.23)] transition hover:-translate-y-0.5 hover:bg-[#075b3a] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
export const secondaryButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-[22px] py-3.5 font-extrabold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
export const dangerButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-600 bg-red-600 px-[22px] py-3.5 font-extrabold text-white transition hover:-translate-y-0.5 hover:border-red-700 hover:bg-red-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';
export const whatsAppButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#25d366] px-[22px] py-3.5 font-extrabold text-[#082d1c] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
export const alertErrorClass =
  'my-[15px] rounded-[10px] border border-red-200 bg-red-50 px-[15px] py-[13px] text-sm text-red-700';
export const alertInfoClass =
  'my-[15px] rounded-[10px] border border-emerald-200 bg-emerald-50 px-[15px] py-[13px] text-sm text-emerald-900';
