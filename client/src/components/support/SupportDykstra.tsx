import { motion } from "framer-motion";

function SupportDykstra() {
  return (
    <motion.a
      href="https://buymeacoffee.com/dykstra"
      target="_blank"
      rel="noopener noreferrer"
      className="
        group
        fixed
        bottom-24
        right-6
        z-50
        flex
        h-12
        items-center
        overflow-hidden
        rounded-full
        border
        border-black/20
        bg-[#FFDD00]
        shadow-lg
      "
      initial={{ width: 48, opacity: 0, scale: 0.8, y: 20 }}
      animate={{ width: 48, opacity: 1, scale: 1, y: 0 }}
      whileHover={{ width: 170 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      {/* Coffee icon */}
      <motion.div
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
        "
        animate={{
          rotate: [0, -8, 8, -5, 5, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
      >
        <span className="text-2xl">☕</span>
      </motion.div>

      {/* Hover text */}
      <motion.span
        className="
          whitespace-nowrap
          pr-4
          text-sm
          font-bold
          text-black
        "
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        Support Dykstra
      </motion.span>
    </motion.a>
  );
}

export default SupportDykstra;