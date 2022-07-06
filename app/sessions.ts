import type { Session } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { createCookieSessionStorage } from "@remix-run/node";

const {
  getSession: getCSession,
  commitSession: commitCSession,
  destroySession,
} = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60,
    path: "/",
    sameSite: "lax",
    secrets: ["s3cret1"],
    secure: true,
  },
});

function getSession(request: Request) {
  return getCSession(request.headers.get("Cookie"));
}

async function commitSession(session: Session, redirectTo = "/") {
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitCSession(session),
    },
  });
}

export { getSession, commitSession, destroySession };
