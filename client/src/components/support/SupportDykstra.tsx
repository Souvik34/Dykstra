/* eslint-disable prettier/prettier */

import { useEffect } from "react";

function SupportDykstra() {
  useEffect(() => {
    if (document.querySelector('script[data-name="BMC-Widget"]')) {
      return;
    }

    const script = document.createElement("script");

    script.type = "text/javascript";
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
    script.setAttribute("data-x_margin", "18");
    script.setAttribute("data-y_margin", "18");

    document.body.appendChild(script);
  }, []);

  return null;
}

export default SupportDykstra;