import { useEffect, useState } from 'react';

let toastListener = null;

export function showToast(message, type = 'success', duration = 3500) {
  if (toastListener) {
    toastListener({
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
      duration,
    });
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    toastListener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(newToast.id);
      }, newToast.duration);
    };

    return () => {
      toastListener = null;
    };
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 left-1/2 z-[9999] flex w-full max-w-md -translate-x-1/2 flex-col gap-3 px-4 sm:left-auto sm:right-5 sm:translate-x-0 sm:px-0 pointer-events-none">
      {toasts.map((toast) => {
        const config = {
          success: {
            title: 'Success',
            icon: '✓',
            accent: 'bg-emerald-500',
            iconBg: 'bg-emerald-500/15',
            iconText: 'text-emerald-400',
            border: 'border-emerald-400/20',
          },
          error: {
            title: 'Error',
            icon: '!',
            accent: 'bg-red-500',
            iconBg: 'bg-red-500/15',
            iconText: 'text-red-400',
            border: 'border-red-400/20',
          },
          info: {
            title: 'Notice',
            icon: 'i',
            accent: 'bg-sky-500',
            iconBg: 'bg-sky-500/15',
            iconText: 'text-sky-400',
            border: 'border-sky-400/20',
          },
        };

        const current = config[toast.type] || config.info;

        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              relative overflow-hidden
              rounded-2xl
              border ${current.border}
              bg-slate-950/90
              px-4 py-4
              shadow-[0_20px_60px_rgba(0,0,0,0.35)]
              backdrop-blur-xl
              animate-[toastIn_0.35s_cubic-bezier(0.16,1,0.3,1)]
            `}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1 ${current.accent}`}
            />

            <div className="flex items-start gap-3">
              <div
                className={`
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl
                  ${current.iconBg}
                  ${current.iconText}
                  text-lg font-black
                `}
              >
                {current.icon}
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <h4 className="text-sm font-bold tracking-tight text-white">
                  {current.title}
                </h4>

                <p className="mt-1 text-sm leading-5 text-slate-300 break-words">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="
                  flex h-8 w-8 shrink-0
                  items-center justify-center
                  rounded-lg
                  text-slate-500
                  transition-all duration-200
                  hover:bg-white/10
                  hover:text-white
                  active:scale-90
                "
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>

            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-white/5">
              <div
                className={`h-full ${current.accent}`}
                style={{
                  animation: `toastProgress ${toast.duration}ms linear forwards`,
                }}
              />
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateY(-14px) scale(0.96);
            filter: blur(4px);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes toastProgress {
          from {
            width: 100%;
          }

          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}