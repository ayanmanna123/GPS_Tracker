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
    if (!window.turnstile) return;

    const widgetId = window.turnstile.render(ref.current, {
      sitekey: SITE_KEY,
      callback: (token) => {
        onVerify(token);
      },
    });

    return () => {
      if (window.turnstile) {
        window.turnstile.remove(widgetId);
      }
    };
  }, []);

  return <div ref={ref}></div>;
};

export default TurnstileCaptcha;
