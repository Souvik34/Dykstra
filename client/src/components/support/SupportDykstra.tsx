import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

function SupportDykstra() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");

    script.src =
      "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
    script.dataset.name = "bmc-button";
    script.dataset.slug = "dykstra";
    script.dataset.color = "#FFDD00";
    script.dataset.emoji = "";
    script.dataset.font = "Comic";
    script.dataset.text = "Buy me a coffee!";
    script.dataset.outlineColor = "#000000";
    script.dataset.fontColor = "#000000";
    script.dataset.coffeeColor = "#ffffff";

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <motion.div
      ref={containerRef}
      className="fixed bottom-24 right-6 z-50"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      whileHover={{
        scale: 1.05,
      }}
    />
  );
}

export default SupportDykstra;