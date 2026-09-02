/* eslint-disable prettier/prettier */
import { useState } from "react";
import { BellRing } from "lucide-react";

interface ReminderProps {
  onContinue: (enabled: boolean) => void;
}

const Reminder = ({ onContinue }: ReminderProps) => {
  const [enabled, setEnabled] = useState(false);

  return (
  <div className="fixed left-0 top-0 z-[9999] flex h-[100dvh] w-[100vw] items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    {/* <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d12] p-6 shadow-2xl"></div */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d12] p-6 shadow-2xl">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
          <BellRing className="h-5 w-5 text-violet-400" />
        </div>

        <h2 className="text-xl font-semibold text-white">
          Never miss a revision
        </h2>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Get an email when your solved problems are ready for revision.
          We&apos;ll only send reminders when you actually have revisions due.
        </p>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-white/20">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-violet-500"
          />

          <div>
            <p className="text-sm font-medium text-white">
              Email me revision reminders
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              You can change this later in Settings.
            </p>
          </div>
        </label>

        <button
          onClick={() => onContinue(enabled)}
          className="mt-6 w-full rounded-xl bg-violet-600 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Reminder;