import { useEffect } from "react";

function SupportDykstra() {
  useEffect(() => {
    const script = document.createElement("script");

    script.setAttribute("data-name", "BMC-Widget");
    script.setAttribute("data-cfasync", "false");
    script.src =
      "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";

    script.setAttribute("data-id", "dykstra");
    script.setAttribute(
      "data-description",
      "Support me on Buy me a coffee!",
    );
    script.setAttribute(
      "data-message",
      "Built with purpose. Supported by you.",
    );
    script.setAttribute("data-color", "#FF813F");
    script.setAttribute("data-position", "Right");

    // Position BMC directly above the bug-report button.
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "75");

    script.async = true;

    script.onload = () => {
      const event = new Event("DOMContentLoaded");
      window.dispatchEvent(event);
    };

    document.head.appendChild(script);

    const style = document.createElement("style");

    style.setAttribute("data-bmc-style", "true");

    style.textContent = `
      /* =========================================
         BMC FLOATING BUTTON
         ========================================= */

      #bmc-wbtn {
        width: 38px !important;
        height: 38px !important;

        border-radius: 50% !important;

        transform: translateX(0) scale(0.9) !important;
        transform-origin: center !important;

        transition:
          transform 220ms ease,
          box-shadow 220ms ease,
          filter 220ms ease !important;

        box-shadow:
          0 0 8px rgba(255, 129, 63, 0.55),
          0 0 20px rgba(255, 129, 63, 0.25) !important;

        filter: brightness(0.96);
      }

      /* Hover = small slide + neon glow */

      #bmc-wbtn:hover {
        transform: translateX(-5px) scale(0.96) !important;

        box-shadow:
          0 0 10px rgba(255, 129, 63, 0.8),
          0 0 25px rgba(255, 129, 63, 0.45),
          0 0 45px rgba(255, 129, 63, 0.18) !important;

        filter: brightness(1.08);
      }


      /* =========================================
         BMC POPUP
         ========================================= */

      #bmc-iframe {
        transform: scale(0.78) !important;
        transform-origin: bottom right !important;
      }
    `;

    document.head.appendChild(style);

    return () => {
      script.remove();
      style.remove();

      document.getElementById("bmc-wbtn")?.remove();
      document.getElementById("bmc-iframe")?.remove();
    };
  }, []);

  return null;
}

export default SupportDykstra;