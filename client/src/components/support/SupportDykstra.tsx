/* eslint-disable prettier/prettier */

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

    // Keep BMC above the bug-report button.
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "75");

    script.async = true;

    script.onload = () => {
      const event = new Event("DOMContentLoaded");
      window.dispatchEvent(event);
    };

    document.head.appendChild(script);

    // Make the BMC button and popup slightly smaller.
    const style = document.createElement("style");

    style.setAttribute("data-bmc-style", "true");

    style.textContent = `
      #bmc-wbtn {
        transform: scale(0.8) !important;
        transform-origin: bottom right !important;
      }

      #bmc-iframe {
        transform: scale(0.8) !important;
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