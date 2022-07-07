import type {
  ActionFunction,
  LinksFunction,
  LoaderFunction,
  Session,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import type { FormEventHandler } from "react";
import { useEffect, useRef } from "react";
import { commitSession, getSession } from "~/sessions";
import styles from "~/styles/main.css";
import debounce from "lodash.debounce";
import { values } from "node-persist";

export const links: LinksFunction = () => [
  {
    href: styles,
    rel: "stylesheet",
  },
];

type Data = {
  compra: string;
  venta: string;
  avg: string;
};

type Dolar = {
  name: string;
  data: {
    fecha: string;
    compra: string;
    venta: string;
  };
};

enum ACTIONS {
  SET_JS = "set-js",
  SELECT_DOLAR = "select-dolar",
  CALC_USD = "calc-usd",
  CALC_ARS = "calc-ars",
}

type LoaderData = {
  error?: boolean;
  message?: string;
  selected?: Dolar;
  dolars?: Dolar[];
  has_js?: boolean;
  usd?: Data;
  ars?: Data;
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request);
  const selected = session.get("selected");
  const has_js = session.get(ACTIONS.SET_JS);
  const ars = session.get("ARS");
  const usd = session.get("USD");

  const URL = "https://api-dolar-argentina.herokuapp.com/api/";
  const promises = [
    "dolaroficial",
    "dolarblue",
    "contadoliqui",
    "dolarturista",
    "dolarbolsa",
  ].map(async (d) => ({
    name: d,
    data: await fetch(URL + d).then((b) => b.json()),
  }));

  try {
    const dolars = await Promise.all(promises);

    return json<LoaderData>({
      dolars,
      selected,
      has_js,
      ars,
      usd,
    });
  } catch (err) {
    return json<LoaderData>({
      error: true,
      message: (err as Error).message,
      selected,
      has_js,
      ars,
      usd,
    });
  }
};

function calcFromSession({
  session,
  data,
  isARS = true,
}: {
  session: Session;
  data: FormData;
  isARS?: boolean;
}) {
  let values = Number(data?.get(isARS ? "ARS" : "USD"));
  if (!values) {
    values = Number(session.get("lastValueSet"));
  }
  const selected: Dolar = session.get("selected");
  session.set(
    "lastPerformedCalcAction",
    isARS ? ACTIONS.CALC_ARS : ACTIONS.CALC_USD
  );
  session.set("lastValueSet", values);

  if (!selected) {
    throw new Error("No hay ningún valor de dolar seleccionado");
  }

  if (values !== 0) {
    if (isARS) {
      session.set("USD", {
        compra: values / Number(selected.data.compra),
        venta: values / Number(selected.data.venta),
        avg: values / Number(calcAvg(selected)),
      });
    } else {
      session.set("ARS", {
        compra: values * Number(selected.data.compra),
        venta: values * Number(selected.data.venta),
        avg: values * Number(calcAvg(selected)),
      });
    }
  }

  return session;
}

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();
  const session = await getSession(request);
  const action = data.get("action");

  if (action === ACTIONS.SET_JS) {
    // add has-js to session
    session.set(ACTIONS.SET_JS, true);
    return commitSession(session, request.url);
  }

  if (action === ACTIONS.CALC_USD) {
    try {
      const newSession = calcFromSession({ session, data, isARS: false });
      return commitSession(newSession, request.url);
    } catch (err) {
      return {
        error: true,
        message: (err as Error).message,
      };
    }
  }

  if (action === ACTIONS.CALC_ARS) {
    try {
      const newSession = calcFromSession({ session, data, isARS: true });
      return commitSession(newSession, request.url);
    } catch (err) {
      return {
        error: true,
        message: (err as Error).message,
      };
    }
  }

  if (action === ACTIONS.SELECT_DOLAR) {
    const name = data.get("dolar")?.toString();
    const compra = data.get(name + "-compra")?.toString();
    const venta = data.get(name + "-venta")?.toString();
    const fecha = data.get(name + "-fecha")?.toString();

    if (!name || !compra || !venta || !fecha) {
      return {
        error: true,
        message: "Malformed selected dolar",
      };
    }

    const selected: Dolar = {
      name,
      data: {
        compra,
        venta,
        fecha,
      },
    };

    session.set("selected", selected);
    const lastPerformedCalcAction = session.get("lastPerformedCalcAction");

    if (lastPerformedCalcAction === ACTIONS.CALC_ARS) {
      console.log("======== RECALCULATING VALUES =======");
      try {
        const newSession = calcFromSession({ session, data, isARS: true });
        return commitSession(newSession, request.url);
      } catch (err) {
        return {
          error: true,
          message: (err as Error).message,
        };
      }
    }

    if (lastPerformedCalcAction === ACTIONS.CALC_USD) {
      console.log("======== RECALCULATING VALUES =======");
      try {
        const newSession = calcFromSession({ session, data, isARS: false });
        return commitSession(newSession, request.url);
      } catch (err) {
        return {
          error: true,
          message: (err as Error).message,
        };
      }
    }

    return commitSession(session, request.url);
  }

  return redirect(request.url);
};

function getDolarFromFormData(formData?: FormData) {
  if (!formData) return;
  const name = formData.get("dolar")?.toString();
  const compra = formData.get(name + "-compra")?.toString();
  const venta = formData.get(name + "-venta")?.toString();
  const fecha = formData.get(name + "-fecha")?.toString();

  if (!name || !compra || !venta || !fecha) return;

  return {
    name,
    data: {
      compra,
      venta,
      fecha,
    },
  };
}

function calcAvg(d?: Dolar) {
  if (!d) return 0;

  const compra = Number(d?.data?.compra || 0);
  const venta = Number(d?.data?.venta || 0);

  if (Number.isNaN(compra) && !Number.isNaN(venta)) return venta;
  if (Number.isNaN(venta) && !Number.isNaN(compra)) return compra;

  return ((compra + venta) / 2).toFixed(2);
}

export default function Index() {
  const hasRun = useRef(false);
  const {
    dolars,
    error,
    message,
    selected: fromSession,
    has_js,
    ars,
    usd,
  } = useLoaderData<LoaderData>();
  const fetcher = useFetcher();
  const submittedData = fetcher.submission?.formData;
  const justSelectedUSD = submittedData?.get("action") === ACTIONS.SELECT_DOLAR;
  const selected: Dolar | undefined = justSelectedUSD
    ? getDolarFromFormData(fetcher.submission?.formData)
    : fromSession;

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;

      const data = new FormData();
      data.set("action", ACTIONS.SET_JS);

      fetcher.submit(data, { method: "post" });
    }
  });

  if (error) {
    return (
      <main>
        <h1>Ups! Hubo un error</h1>
        <p>{message}</p>
      </main>
    );
  }

  const formChanged: FormEventHandler<HTMLFormElement> = (event) => {
    const data = new FormData();
    const name = (event.target as HTMLInputElement).value;
    const dolar = dolars?.find((d) => d.name === name);
    if (!dolar) return;

    data.set("dolar", name);
    data.set("action", ACTIONS.SELECT_DOLAR);
    data.set(name + "-compra", dolar.data.compra);
    data.set(name + "-venta", dolar.data.venta);
    data.set(name + "-fecha", dolar.data.fecha);

    fetcher.submit(data, { method: "post" });
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
  };

  const handleCalc: FormEventHandler<HTMLFormElement> = (event) => {
    const form = (event.target as HTMLInputElement).closest("form");
    if (!form) return;
    const data = new FormData(form);
    fetcher.submit(data, { method: "post" });
  };

  return (
    <main className={has_js ? "has-js" : ""}>
      <div className="prices">
        <h6 className="compra">
          <span>Compra:</span>
          <span>{selected?.data?.compra || null}</span>
        </h6>
        <h6 className="venta">
          <span>Venta:</span>
          <span>{selected?.data?.venta || null}</span>
        </h6>
        <h6 className="promedio">
          <span>Promedio:</span>
          <span>{calcAvg(selected)}</span>
        </h6>
      </div>
      <fetcher.Form
        method="post"
        onSubmit={handleSubmit}
        onChange={formChanged}
      >
        {dolars ? (
          <ul>
            {dolars.map((dolar) => (
              <li key={dolar.name}>
                <input
                  type="hidden"
                  name={`${dolar.name}-compra`}
                  id={dolar.data.compra}
                  value={dolar.data.compra}
                />
                <input
                  type="hidden"
                  name={`${dolar.name}-venta`}
                  id={dolar.data.venta}
                  value={dolar.data.venta}
                />
                <input
                  type="hidden"
                  name={`${dolar.name}-fecha`}
                  id={dolar.data.fecha}
                  value={dolar.data.fecha}
                />
                <input
                  type="radio"
                  name="dolar"
                  id={dolar.name}
                  value={dolar.name}
                  defaultChecked={selected?.name === dolar.name}
                />
                <label htmlFor={dolar.name}>
                  <span>{dolar.name.replace("dolar", "")}</span>
                </label>
              </li>
            ))}
          </ul>
        ) : null}

        <input type="hidden" name="action" value={ACTIONS.SELECT_DOLAR} />
        {has_js ? null : <button type="submit">Elegir</button>}
      </fetcher.Form>
      <fetcher.Form
        className="calc"
        method="post"
        onChange={debounce(handleCalc, 1000)}
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="action" value={ACTIONS.CALC_ARS} />
        <label htmlFor="ARS">
          ARS:
          <input type="number" name="ARS" id="ARS" />
        </label>
        {has_js ? null : <button type="submit">Calcular</button>}
      </fetcher.Form>
      <div className="info">
        <p className="compra">
          <span>Compra:</span>
          {usd?.compra ? (
            <span>
              {Number(usd?.compra)?.toFixed(2) || "-"}{" "}
              <span className="currency">USD</span>
            </span>
          ) : null}
        </p>
        <p className="venta">
          <span>Venta:</span>
          {usd?.venta ? (
            <span>
              {Number(usd?.venta)?.toFixed(2) || "-"}{" "}
              <span className="currency">USD</span>
            </span>
          ) : null}
        </p>
        <p className="promedio">
          <span>Promedio:</span>
          {usd?.avg ? (
            <span>
              {Number(usd?.avg)?.toFixed(2)}{" "}
              <span className="currency">USD</span>
            </span>
          ) : null}
        </p>
      </div>
      <fetcher.Form
        method="post"
        className="calc"
        onChange={debounce(handleCalc, 1000)}
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="action" value={ACTIONS.CALC_USD} />
        <label htmlFor="USD">
          USD:
          <input type="number" name="USD" id="USD" />
        </label>
        {has_js ? null : <button type="submit">Calcular</button>}
      </fetcher.Form>
      <div className="info">
        <p className="compra">
          <span>Compra:</span>
          {ars?.compra ? (
            <span>
              {Number(ars?.compra).toFixed(2) || "-"}{" "}
              <span className="currency">ARS</span>
            </span>
          ) : null}
        </p>
        <p className="venta">
          <span>Venta:</span>
          {ars?.venta ? (
            <span>
              {Number(ars?.venta).toFixed(2) || "-"}{" "}
              <span className="currency">ARS</span>
            </span>
          ) : null}
        </p>
        <p className="promedio">
          <span>Promedio:</span>
          {ars?.avg ? (
            <span>
              {Number(ars?.avg).toFixed(2)}{" "}
              <span className="currency">ARS</span>
            </span>
          ) : null}
        </p>
      </div>
    </main>
  );
}
