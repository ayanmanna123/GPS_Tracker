import { useEffect, useRef } from "react";

const TurnstileCaptcha = ({ onVerify }) => {
  const ref = useRef(null);
  const hostname = window.location.hostname;
  let SITE_KEY = "";
  if (hostname === "localhost") {
    SITE_KEY = "0x4AAAAAACLpDPvIpoBRPbMe";
  } else if (hostname === "gps-tracker-umber.vercel.app") {
    SITE_KEY = "0x4AAAAAAACLpDPvIpoBRPbMe";
  } else if (hostname === "gps-map-nine.vercel.app") {
    SITE_KEY = "0x4AAAAAACLoq3Wk-omggzWD";
  } else {
    SITE_KEY = "0x4AAAAAACLtFkqc1CCF60KP";
  }
  useEffect(() => {
    let widgetId = null;
    let retryCount = 0;
    const maxRetries = 10;

    const renderWidget = () => {
      if (window.turnstile) {
        widgetId = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          callback: (token) => {
            onVerify(token);
          },
        });
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(renderWidget, 500);
      }
    };

    renderWidget();

    return () => {
      if (window.turnstile && widgetId) {
        window.turnstile.remove(widgetId);
      }
    };
  }, [SITE_KEY, onVerify]);

  return <div ref={ref}></div>;
};

export default TurnstileCaptcha;
