import { steps } from './constants';

export default function StepHeading({ number, title, children, center = false }) {
  return (
    <div className={`mb-[30px] ${center ? 'text-center' : ''}`}>
      <span className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#0f7b4f]">
        Step {number} of {steps.length}
      </span>
      <h2 className="mt-2 mb-3.5 text-[clamp(2rem,4vw,3.15rem)] leading-tight">
        {title}
      </h2>
      <p className="m-0 text-slate-500">{children}</p>
    </div>
  );
}
