import { useEffect, useRef } from "react";

const TurnstileCaptcha = ({ onVerify, theme = "auto" }) => {
  const ref = useRef(null);
  const hostname = window.location.hostname;
  let SITE_KEY = "";
  if (hostname === "localhost") {
    SITE_KEY = "0x4AAAAAACLpDPvIpoBRPbMe";
  } else if (hostname === "gps-tracker-umber.vercel.app") {
    SITE_KEY = "0x4AAAAAACLpDPvIpoBRPbMe";
  } else if (hostname === "gps-map-nine.vercel.app") {
    SITE_KEY = "0x4AAAAAACLoq3Wk-omggzWD";
  } else {
    SITE_KEY = "0x4AAAAAACLtFkqc1CCF60KP";
  }

  useEffect(() => {
    let widgetId = null;
    let retryCount = 0;
    const maxRetries = 20;

    const renderWidget = () => {
      if (window.turnstile) {
        console.log("Turnstile script found, rendering widget...");
        try {
          // Clear any existing content
          if (ref.current) ref.current.innerHTML = "";
          
          widgetId = window.turnstile.render(ref.current, {
            sitekey: SITE_KEY,
            theme: theme,
            callback: (token) => {
              console.log("Turnstile token received");
              onVerify(token);
            },
            "error-callback": (error) => {
              console.error("Turnstile error:", error);
            }
          });
        } catch (err) {
          console.error("Turnstile render error:", err);
        }
      } else if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Turnstile not ready, retrying (${retryCount}/${maxRetries})...`);
        setTimeout(renderWidget, 500);
      } else {
        console.error("Turnstile failed to load after maximum retries");
      }
    };

    renderWidget();

    return () => {
      if (window.turnstile && widgetId) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [SITE_KEY, onVerify, theme]);

  return <div ref={ref} style={{ minHeight: "65px", minWidth: "300px", transition: "all 0.3s ease" }}></div>;
};

export default TurnstileCaptcha;
