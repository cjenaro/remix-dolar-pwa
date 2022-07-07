import React from "react";
import { useLocation, useMatches } from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import msTile144 from "~/icons/mstile-144x144.png";
import msTile70 from "~/icons/mstile-70x70.png";
import msTile150 from "~/icons/mstile-150x150.png";
import msTile310x150 from "~/icons/mstile-310x150.png";
import msTile310 from "~/icons/mstile-310x310.png";

import appleTouchIcon57 from "~/icons/apple-touch-icon-57x57.png";
import appleTouchIcon114 from "~/icons/apple-touch-icon-114x114.png";
import appleTouchIcon72 from "~/icons/apple-touch-icon-72x72.png";
import appleTouchIcon144 from "~/icons/apple-touch-icon-144x144.png";
import appleTouchIcon60 from "~/icons/apple-touch-icon-60x60.png";
import appleTouchIcon120 from "~/icons/apple-touch-icon-120x120.png";
import appleTouchIcon76 from "~/icons/apple-touch-icon-76x76.png";
import appleTouchIcon152 from "~/icons/apple-touch-icon-152x152.png";

import favicon196 from "~/icons/favicon-196x196.png";
import favicon96 from "~/icons/favicon-96x96.png";
import favicon32 from "~/icons/favicon-32x32.png";
import favicon16 from "~/icons/favicon-16x16.png";
import favicon12 from "~/icons/favicon-128.png";

let isMount = true;

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "DolAR",
  viewport: "width=device-width,initial-scale=1",
  "application-name": "DolAR",
  "msapplication-TileColor": "#FFFFFF",
  "msapplication-TileImage": msTile144,
  "msapplication-square70x70logo": msTile70,
  "msapplication-square150x150logo": msTile150,
  "msapplication-wide310x150logo": msTile310x150,
  "msapplication-square310x310logo": msTile310,
  description: "Dolar PWA",
  "theme-color": "#663399",
  "apple-mobile-web-app-capable": "yes",
  "apple-mobile-web-app-status-bar-style": "black",
  "apple-mobile-web-app-title": "Dolar",
});

export const links: LinksFunction = () => [
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "57x57",
    href: appleTouchIcon57,
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "114x114",
    href: appleTouchIcon114,
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "72x72",
    href: appleTouchIcon72,
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "144x144",
    href: appleTouchIcon144,
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "60x60",
    href: appleTouchIcon60,
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "120x120",
    href: appleTouchIcon120,
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "76x76",
    href: appleTouchIcon76,
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "152x152",
    href: appleTouchIcon152,
  },
  {
    rel: "icon",
    type: "image/png",
    href: favicon196,
    sizes: "196x196",
  },
  { rel: "icon", type: "image/png", href: favicon96, sizes: "96x96" },
  { rel: "icon", type: "image/png", href: favicon32, sizes: "32x32" },
  { rel: "icon", type: "image/png", href: favicon16, sizes: "16x16" },
  { rel: "icon", type: "image/png", href: favicon12, sizes: "128x128" },
];

export default function App() {
  let location = useLocation();
  let matches = useMatches();

  React.useEffect(() => {
    let mounted = isMount;
    isMount = false;
    if ("serviceWorker" in navigator) {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller?.postMessage({
          type: "REMIX_NAVIGATION",
          isMount: mounted,
          location,
          matches,
          manifest: window.__remixManifest,
        });
      } else {
        let listener = async () => {
          await navigator.serviceWorker.ready;
          navigator.serviceWorker.controller?.postMessage({
            type: "REMIX_NAVIGATION",
            isMount: mounted,
            location,
            matches,
            manifest: window.__remixManifest,
          });
        };
        navigator.serviceWorker.addEventListener("controllerchange", listener);
        return () => {
          navigator.serviceWorker.removeEventListener(
            "controllerchange",
            listener
          );
        };
      }
    }
  }, [location, matches]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <link rel="manifest" href="/resources/manifest.webmanifest" />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
