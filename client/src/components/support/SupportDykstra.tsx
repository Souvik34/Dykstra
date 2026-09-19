/* eslint-disable prettier/prettier */

import { motion } from "framer-motion";

function SupportDykstra() {
  return (
    <motion.a
      href="https://www.buymeacoffee.com/dykstra"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Support Dykstra"
      className="fixed right-0 bottom-20 z-[100] block"
      initial={{ x: 115 }}
      animate={{ x: 115 }}
      whileHover={{ x: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
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