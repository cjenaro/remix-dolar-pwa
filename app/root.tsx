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

let isMount = true;

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "DolAR",
  viewport: "width=device-width,initial-scale=1",
  "application-name": "DolAR",
  "msapplication-TileColor": "#FFFFFF",
  "msapplication-TileImage": "mstile-144x144.png",
  "msapplication-square70x70logo": "mstile-70x70.png",
  "msapplication-square150x150logo": "mstile-150x150.png",
  "msapplication-wide310x150logo": "mstile-310x150.png",
  "msapplication-square310x310logo": "mstile-310x310.png",
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
    href: "apple-touch-icon-57x57.png",
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "114x114",
    href: "apple-touch-icon-114x114.png",
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "72x72",
    href: "apple-touch-icon-72x72.png",
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "144x144",
    href: "apple-touch-icon-144x144.png",
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "60x60",
    href: "apple-touch-icon-60x60.png",
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "120x120",
    href: "apple-touch-icon-120x120.png",
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "76x76",
    href: "apple-touch-icon-76x76.png",
  },
  {
    rel: "apple-touch-icon-precomposed",
    sizes: "152x152",
    href: "apple-touch-icon-152x152.png",
  },
  {
    rel: "icon",
    type: "image/png",
    href: "favicon-196x196.png",
    sizes: "196x196",
  },
  { rel: "icon", type: "image/png", href: "favicon-96x96.png", sizes: "96x96" },
  { rel: "icon", type: "image/png", href: "favicon-32x32.png", sizes: "32x32" },
  { rel: "icon", type: "image/png", href: "favicon-16x16.png", sizes: "16x16" },
  { rel: "icon", type: "image/png", href: "favicon-128.png", sizes: "128x128" },
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
