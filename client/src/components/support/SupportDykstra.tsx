import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function SupportDykstra() {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // BMC creates its button after the script loads.
    const script = document.createElement("script");

    script.src =
      "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";

    script.setAttribute("data-name", "bmc-button");
    script.setAttribute("data-slug", "dykstra");
    script.setAttribute("data-color", "#FFDD00");
    script.setAttribute("data-emoji", "");
    script.setAttribute("data-font", "Comic");
    script.setAttribute("data-text", "Buy me a coffee!");
    script.setAttribute("data-outline-color", "#000000");
    script.setAttribute("data-font-color", "#000000");
    script.setAttribute("data-coffee-color", "#ffffff");

    const container = document.getElementById("bmc-support-button");

    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <motion.div
      className="fixed bottom-24 right-6 z-50"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        animate={{
          y: hovered ? -2 : [0, -3, 0],
        }}
        transition={{
          y: hovered
            ? {
                duration: 0.2,
              }
            : {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
        }}
      >
        <div id="bmc-support-button" />
      </motion.div>
    </motion.div>
  );
}

export default SupportDykstra;