/* eslint-disable prettier/prettier */
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import Preview from "../../assets/images/Preview.png"
type AboutLinkPreviewProps = {
  children: React.ReactNode;
};

export function AboutLinkPreview({
  children,
}: AboutLinkPreviewProps) {
  const [active, setActive] = useState(false);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showPreview = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }

    setActive(true);

    setPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const movePreview = (e: React.MouseEvent<HTMLSpanElement>) => {
    setPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const hidePreview = () => {
    hideTimer.current = setTimeout(() => {
      setActive(false);
    }, 100);
  };

  return (
    <span
      className="inline-block"
      onMouseEnter={showPreview}
      onMouseMove={movePreview}
      onMouseLeave={hidePreview}
    >
      {/* Colored hover text */}
      <span
        className="
          cursor-pointer
          text-violet-400
          transition-colors
          duration-200
          hover:text-violet-300
        "
      >
        {children}
      </span>

      {/* Shared preview */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
              x: position.x - 144,
              y: position.y - 220,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: position.x - 144,
              y: position.y - 220,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
            }}
            transition={{
              opacity: {
                duration: 0.15,
              },
              scale: {
                duration: 0.15,
              },
              x: {
                type: "spring",
                stiffness: 400,
                damping: 30,
              },
              y: {
                type: "spring",
                stiffness: 400,
                damping: 30,
              },
            }}
            className="
              pointer-events-none
              fixed
              left-0
              top-0
              z-[100]
              w-72
            "
          >
            <Link
              to="/about"
              className="
                pointer-events-auto
                group
                block
                overflow-hidden
                rounded-2xl
                border
                border-white/[0.1]
                bg-[#0b0b0f]
                text-left
                shadow-2xl
                shadow-black/40
              "
            >
              {/* Your image */}
              <div className="relative h-36 overflow-hidden">
                <img
                  src={Preview}
                  alt="Preview of the About Dykstra page"
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-105
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/70
                    via-black/10
                    to-transparent
                  "
                />
              </div>

              {/* Same content for EVERY hover target */}
              <div className="p-4">
             

                <p className="mt-1 text-xs text-white/40">
                  Click to know more about Dykstra
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-white/35">
                    About Dykstra
                  </span>

                  <span
                    className="
                      text-xs
                      font-medium
                      text-violet-400
                      transition-colors
                      group-hover:text-pink-400
                    "
                  >
                    View page →
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}