/* eslint-disable prettier/prettier */

import { useEffect } from "react";

function SupportDykstra() {
  useEffect(() => {
    const existing = document.querySelector(
      'script[data-name="BMC-Widget"]',
    );

    if (existing) {
      return;
    }

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

    // Bug button is around 18px from bottom.
    // Put BMC above it.
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "75");

    document.head.appendChild(script);

    return () => {
      script.remove();

      // Remove the BMC widget iframe/container when leaving Dashboard.
      document
        .querySelectorAll(
          'iframe[src*="buymeacoffee"], [id*="bmc"], [class*="bmc"]',
        )
        .forEach((element) => {
          element.remove();
        });
    };
  }, []);

  return null;
}

export default SupportDykstra;