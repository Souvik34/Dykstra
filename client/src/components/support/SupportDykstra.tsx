/* eslint-disable prettier/prettier */

import { motion } from "framer-motion";

function SupportDykstra() {
  return (
    <motion.a
      href="https://www.buymeacoffee.com/dykstra"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Support Dykstra"
      className="
        fixed
        bottom-20
        right-6
        z-50
        block
      "
      initial={{
        opacity: 0,
        y: 12,
        scale: 0.9,
      }}
      animate={{
        opacity: 1,
        y: [0, -3, 0],
        scale: [1, 1.03, 1],
      }}
      transition={{
        opacity: {
          duration: 0.3,
        },
        y: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
        scale: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      whileHover={{
        scale: 1.06,
      }}
    >
      <img
        src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=dykstra&button_colour=FFDD00&font_colour=000000&font_family=Comic&outline_colour=000000&coffee_colour=ffffff"
        alt="Buy me a coffee"
        className="h-auto w-[150px]"
      />
    </motion.a>
  );
}

export default SupportDykstra;