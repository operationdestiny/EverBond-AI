import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_SOURCES = [
  "https://veniceai-status.com",
  "https://veniceai.statuspage.io"
] as const;

const CONFIRMED_OUTAGE_STATUSES = new Set([
  "partial_outage",
  "major_outage"
]);

type StatusComponent = {
  id?: unknown;
  name?: unknown;
  status?: unknown;
};

type StatusSummary = {
  page?: {
    id?: unknown;
    name?: unknown;
    updated_at?: unknown;
  };
  components?: StatusComponent[];
};

type StatusIncident = {
  id?: unknown;
  name?: unknown;
  status?: unknown;
  resolved_at?: unknown;
  components?: StatusComponent[];
};

type StatusIncidents = {
  page?: {
    id?: unknown;
    name?: unknown;
    updated_at?: unknown;
  };
  incidents?: StatusIncident[];
};

type SourceCheck = {
  source: string;
  available: boolean;
  apiStatus: string | null;
  hasMatchingIncident: boolean;
  incidentName: string | null;
};

function normalizedText(value: unknown) {
  return typeof value === "string"
    ? value.trim().toLocaleLowerCase()
    : "";
}

function componentIsVeniceApi(component: StatusComponent) {
  return normalizedText(component.name) === "venice api";
}

function outageStatus(value: unknown) {
  const status = normalizedText(value);
  return CONFIRMED_OUTAGE_STATUSES.has(status);
}

async function fetchStatusJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache"
      },
      signal: AbortSignal.timeout(4_000)
    });

    if (!response.ok) return null;

    const payload = await response.json().catch(() => null);
    if (!payload || typeof payload !== "object") return null;

    return payload as T;
  } catch {
    return null;
  }
}

async function checkSource(source: string): Promise<SourceCheck> {
  const cacheBust = Date.now().toString(36);
  const [summary, unresolved] = await Promise.all([
    fetchStatusJson<StatusSummary>(
      `${source}/api/v2/summary.json?eb=${cacheBust}`
    ),
    fetchStatusJson<StatusIncidents>(
      `${source}/api/v2/incidents/unresolved.json?eb=${cacheBust}`
    )
  ]);

  if (!summary || !unresolved) {
    return {
      source,
      available: false,
      apiStatus: null,
      hasMatchingIncident: false,
      incidentName: null
    };
  }

  const apiComponent = Array.isArray(summary.components)
    ? summary.components.find(componentIsVeniceApi)
    : undefined;

  const apiStatus =
    typeof apiComponent?.status === "string"
      ? apiComponent.status.trim().toLocaleLowerCase()
      : null;

  if (!apiStatus) {
    return {
      source,
      available: false,
      apiStatus: null,
      hasMatchingIncident: false,
      incidentName: null
    };
  }

  const incidents = Array.isArray(unresolved.incidents)
    ? unresolved.incidents
    : [];

  const matchingIncident = incidents.find((incident) => {
    if (incident.resolved_at) return false;

    const incidentStatus = normalizedText(incident.status);
    if (incidentStatus === "resolved" || incidentStatus === "postmortem") {
      return false;
    }

    const components = Array.isArray(incident.components)
      ? incident.components
      : [];

    return components.some(
      (component) =>
        componentIsVeniceApi(component) &&
        outageStatus(component.status)
    );
  });

  return {
    source,
    available: true,
    apiStatus,
    hasMatchingIncident: Boolean(matchingIncident),
    incidentName:
      typeof matchingIncident?.name === "string"
        ? matchingIncident.name.trim()
        : null
  };
}

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const checks = await Promise.all(
      STATUS_SOURCES.map((source) => checkSource(source))
    );

    // Intentionally fail open. EverBond warns only when BOTH official
    // Statuspage domains independently agree on the outage and BOTH expose
    // an unresolved Venice API incident. Any disagreement or monitor failure
    // means "do not warn".
    const confirmedOutage =
      checks.length === STATUS_SOURCES.length &&
      checks.every(
        (check) =>
          check.available &&
          outageStatus(check.apiStatus) &&
          check.hasMatchingIncident
      );

    const incidentNames = Array.from(
      new Set(
        checks
          .map((check) => check.incidentName)
          .filter(
            (value): value is string =>
              typeof value === "string" && value.length > 0
          )
      )
    );

    return NextResponse.json(
      {
        confirmedOutage,
        sourceAvailable: checks.every((check) => check.available),
        providerStatus: confirmedOutage ? "outage" : "not_confirmed",
        incidentName:
          confirmedOutage && incidentNames.length === 1
            ? incidentNames[0]
            : null,
        checkedAt
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0"
        }
      }
    );
  } catch {
    return NextResponse.json(
      {
        confirmedOutage: false,
        sourceAvailable: false,
        providerStatus: "not_confirmed",
        incidentName: null,
        checkedAt
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0"
        }
      }
    );
  }
}
