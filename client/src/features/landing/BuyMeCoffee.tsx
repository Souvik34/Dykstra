import { motion } from "framer-motion";

export default function BuyMeCoffee() {
  return (
    <section className="relative overflow-hidden py-6">
      <div className="mx-auto max-w-4xl px-6">
        <motion.a
          href="https://www.buymeacoffee.com/dykstra"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ y: -4 }}
          className="group relative block overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] px-6 py-10 transition-colors duration-500 hover:border-yellow-400/20 sm:px-10 sm:py-12"
        >
          {/* Ambient glow */}
          <motion.div
            className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-yellow-400/[0.07] blur-3xl"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-yellow-400/[0.035] blur-3xl"
            animate={{
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Shimmer */}
          <motion.div
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
            animate={{
              left: ["-50%", "150%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />

          <div className="relative flex flex-col items-center justify-between gap-8 sm:flex-row sm:text-left">
            {/* Left */}
            <div className="flex items-center gap-5">
              {/* Official BMC-style icon */}
              <motion.div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-400/20 bg-[#FFDD00] shadow-[0_0_30px_rgba(255,221,0,0.08)]"
                whileHover={{
                  rotate: [-3, 3, -2, 2, 0],
                  scale: 1.05,
                }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                  alt="Buy Me a Coffee"
                  className="h-9 w-9"
                />
              </motion.div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400/70">
                  Support Dykstra
                </p>

                <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-white sm:text-2xl">
                  Enjoying Dykstra?
                </h3>

                <p className="mt-1.5 max-w-md text-sm leading-6 text-white/40">
                  Help keep the project growing with a coffee.
                </p>
              </div>
            </div>

            {/* Button */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#FFDD00] px-5 py-3 text-sm font-black text-black shadow-[0_8px_30px_rgba(255,221,0,0.08)] transition-shadow duration-300 group-hover:shadow-[0_10px_40px_rgba(255,221,0,0.18)]"
            >
              <img
                src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                alt=""
                className="h-5 w-5"
              />

              <span>Buy me a coffee</span>

              <motion.span
                initial={{ x: 0 }}
                animate={{ x: [0, 3, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                →
              </motion.span>
            </motion.div>
          </div>
        </motion.a>
      </div>
    </section>
  );
}