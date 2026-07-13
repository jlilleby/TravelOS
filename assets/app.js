const API = {
  trips: "api/trips.php",
  events: "api/events.php",
  documents: "api/documents.php",
  packing: "api/packing.php",
  budget: "api/budget.php",
  import: "api/import.php",
};

const FEATURE_SAVED_VIEWS = false;

const EVENT_TYPES = [
  "flight",
  "drive",
  "accommodation",
  "car_rental",
  "ferry",
  "poi",
  "photo",
  "food",
  "fuel",
  "shopping",
  "hike",
  "reminder",
  "special",
];

const DISPLAY_MODE_OPTIONS = [
  ["timeline", "Timeline"],
  ["status", "Status"],
];

const QUICK_FILTERS = {
  all: { label: "Alle", types: [] },
  transport: { label: "Transport", types: ["flight", "drive", "car_rental", "ferry"] },
  accommodation: { label: "Overnatting", types: ["accommodation"] },
  poi: { label: "POI", types: ["poi"] },
  photo: { label: "Foto", types: ["photo"] },
};

const PACKING_CATEGORIES = [
  "General",
  "Toiletries",
  "Base layer (underwear, wool, thermal)",
  "Mid layer (fleece, sweater)",
  "Outer layer (jacket, shell)",
  "Footwear",
  "Electronics",
  "Documents",
  "Health & medicine",
  "Outdoor gear",
];

const FIELD_SETS = {
  flight: [
    ["flightNo", "Flightnummer", "text"],
    ["airline", "Flyselskap", "text"],
    ["fromAirport", "Fra", "text"],
    ["toAirport", "Til", "text"],
    ["booking", "Bookingreferanse", "text"],
  ],
  drive: [
    ["startLocation", "Fra", "text"],
    ["viaLocations", "Via (linjeskift eller semikolon)", "textarea"],
    ["endLocation", "Til", "text"],
    ["estimatedDriveTime", "Estimert kjøretid", "text"],
  ],
  accommodation: [
    ["subtype", "Subtype (hotel/camp/etc)", "text"],
    ["location", "Lokasjon", "text"],
    ["booking", "Bookingreferanse", "text"],
    ["checkin", "Check-in info", "text"],
    ["checkout", "Check-out info", "text"],
  ],
  car_rental: [
    ["company", "Selskap", "text"],
    ["pickupLocation", "Henting", "text"],
    ["dropoffLocation", "Levering", "text"],
    ["booking", "Bookingreferanse", "text"],
  ],
  ferry: [
    ["company", "Operatør", "text"],
    ["fromAirport", "Fra", "text"],
    ["toAirport", "Til", "text"],
    ["booking", "Bookingreferanse", "text"],
  ],
  poi: [
    ["location", "Lokasjon", "text"],
    ["category", "Kategori", "text"],
    ["priority", "Prioritet", "text"],
  ],
  photo: [
    ["location", "Fotolokasjon", "text"],
    ["gps", "GPS", "text"],
    ["camera", "Kamera", "text"],
    ["lens", "Objektiv", "text"],
  ],
  food: [
    ["place", "Sted", "text"],
    ["mealType", "Måltid", "text"],
    ["reservation", "Reservasjon", "text"],
  ],
  fuel: [
    ["station", "Stasjon", "text"],
    ["pricePerLiter", "Pris per liter", "number"],
    ["odometer", "Kilometerstand", "number"],
  ],
  shopping: [
    ["store", "Butikk", "text"],
    ["shoppingList", "Handleliste", "textarea"],
  ],
  hike: [
    ["trailName", "Tur", "text"],
    ["startLocation", "Start", "text"],
    ["endLocation", "Slutt", "text"],
    ["distanceKm", "Distanse km", "number"],
  ],
  reminder: [["reminderText", "Påminnelse", "textarea"]],
  special: [
    ["subtype", "Subtype", "text"],
    ["location", "Sted", "text"],
    ["notes", "Detaljer", "textarea"],
  ],
};

const state = {
  trips: [],
  currentTripId: null,
  events: [],
  documents: [],
  packing: [],
  budget: [],
  filters: {
    quick: "all",
    search: "",
    eventType: "",
    from: "",
    to: "",
  },
  showCreateModal: false,
  editEventId: null,
  view: "dashboard",
  routesView: "today",
};

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m] || m));
}

function icon(t) {
  return {
    flight: "✈️",
    drive: "🚗",
    accommodation: "🏨",
    car_rental: "🚙",
    ferry: "⛴️",
    poi: "📍",
    photo: "📷",
    food: "🍽️",
    fuel: "⛽",
    shopping: "🛒",
    hike: "🥾",
    reminder: "🔔",
    special: "✨",
  }[t] || "📌";
}

function typeName(t) {
  return {
    flight: "Flight",
    drive: "Drive",
    accommodation: "Accommodation",
    car_rental: "Car rental",
    ferry: "Ferry",
    poi: "POI",
    photo: "Photo",
    food: "Food",
    fuel: "Fuel",
    shopping: "Shopping",
    hike: "Hike",
    reminder: "Reminder",
    special: "Special",
  }[t] || "Event";
}

function asIsoDate(v) {
  return String(v || "").slice(0, 10);
}

function normalizeDisplayMode(v, eventType = "") {
  const mode = String(v || "").toLowerCase();
  if (mode === "timeline" || mode === "status") return mode;
  if (mode === "daily") return "status";
  if (mode === "single" || mode === "range") return "timeline";
  return eventType === "accommodation" ? "status" : "timeline";
}

function normalizeEvent(input) {
  const event = { ...input };
  const data = event.data && typeof event.data === "object" ? { ...event.data } : {};
  event.event_type = String(event.event_type || "").replace(/-/g, "_").toLowerCase();

  const map = {
    car: "car_rental",
    car_rental: "car_rental",
    camp: "accommodation",
    camping: "accommodation",
    hotel: "accommodation",
    workshop: "special",
    special_event: "special",
    eclipse: "special",
    cruise: "special",
  };

  if (map[event.event_type]) event.event_type = map[event.event_type];
  if (!EVENT_TYPES.includes(event.event_type)) event.event_type = "special";

  if ((event.event_type === "accommodation" || event.event_type === "special") && !String(data.subtype || "").trim()) {
    data.subtype = event.event_type === "accommodation" ? "general" : "other";
  }

  event.data = data;
  event.display_mode = normalizeDisplayMode(event.display_mode, event.event_type);
  event.start_date = asIsoDate(event.start_date);
  event.end_date = asIsoDate(event.end_date || "");
  return event;
}

async function api(url, opts = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: opts.body && !(opts.body instanceof FormData) ? { "Content-Type": "application/json" } : {},
    ...opts,
  });
  if (response.status === 401) location.href = "login.php";
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error || "API error");
  return data;
}

function currentTrip() {
  return state.trips.find((t) => Number(t.id) === Number(state.currentTripId));
}

function itineraryEvents() {
  return [...state.events].map(normalizeEvent).sort((a, b) => {
    const ka = `${a.start_date}|${a.start_time || ""}|${a.sort_order || 0}`;
    const kb = `${b.start_date}|${b.start_time || ""}|${b.sort_order || 0}`;
    return ka.localeCompare(kb);
  });
}

async function loadTripData() {
  if (!state.currentTripId) return;
  localStorage.setItem("travel_os_current_trip", String(state.currentTripId));
  const q = `?trip_id=${state.currentTripId}`;
  const [events, docs, packing, budget] = await Promise.all([
    api(API.events + q),
    api(API.documents + q),
    api(API.packing + q),
    api(API.budget + q),
  ]);
  state.events = (events || []).map(normalizeEvent);
  state.documents = docs || [];
  state.packing = packing || [];
  state.budget = budget || [];
}

function navButton(key, iconText, title) {
  return `<button data-view="${key}" class="${state.view === key ? "active" : ""}">${iconText} ${title}</button>`;
}

function header(kicker, title, subtitle, actions = "") {
  return `<div class="topbar"><div><div class="kicker">${kicker}</div><h2>${title}</h2><p class="subtitle">${subtitle}</p></div><div class="actions">${actions}</div></div>`;
}

function render() {
  document.getElementById("app").innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="logo">
          <div class="logo-mark">🧭</div>
          <div><h1>Travel OS</h1><p>Cleanup release</p></div>
        </div>
        <div class="field">
          <label>Tur</label>
          <select id="trip-select">${state.trips.map((t) => `<option value="${t.id}" ${Number(t.id) === Number(state.currentTripId) ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select>
        </div>
        <div class="nav">
          ${navButton("dashboard", "🏠", "Dashboard")}
          ${navButton("timeline", "📅", "Timeline")}
          ${navButton("routes", "🗺️", "Routes")}
          ${navButton("export", "📤", "Export")}
          ${navButton("documents", "📄", "Documents")}
          ${navButton("packing", "🧳", "Packing")}
          ${navButton("budget", "💰", "Budget")}
          ${navButton("settings", "⚙️", "Settings")}
        </div>
        <div class="sidebar-footer"><a href="logout.php">Logg ut</a></div>
      </aside>
      <main class="main">${content()}</main>
    </div>
    ${eventModal()}
  `;
  bind();
}

function content() {
  if (!state.currentTripId) return newTripPage();
  return {
    dashboard,
    timeline,
    routes,
    export: exportPage,
    documents,
    packing,
    budget,
    settings,
  }[state.view]();
}

function dashboard() {
  const t = currentTrip();
  const total = state.budget.reduce((acc, item) => acc + Number(item.amount || 0), 0);
  const nextEvents = itineraryEvents().slice(0, 5);
  return `
    ${header("Oversikt", esc(t?.name || "Tur"), `${esc(t?.start_date || "")} → ${esc(t?.end_date || "")}`)}
    <div class="grid cols-3">
      <div class="card stat"><div><span class="muted">Events</span><br><strong>${state.events.length}</strong></div><div>📅</div></div>
      <div class="card stat"><div><span class="muted">Dokumenter</span><br><strong>${state.documents.length}</strong></div><div>📄</div></div>
      <div class="card stat"><div><span class="muted">Budsjett</span><br><strong>${total.toLocaleString("no-NO")} kr</strong></div><div>💰</div></div>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>Neste hendelser</h3>
      <div class="list">
        ${nextEvents.length ? nextEvents.map((e) => `<div class="item"><div><strong>${icon(e.event_type)} ${esc(e.title)}</strong><br><span class="muted">${esc(e.start_date)} ${(e.start_time || "").slice(0, 5)} · ${esc(typeName(e.event_type))}</span></div></div>`).join("") : `<div class="empty">Ingen hendelser.</div>`}
      </div>
    </div>
  `;
}

function quickFilterButtons() {
  return Object.entries(QUICK_FILTERS).map(([key, item]) => `<button class="small ${state.filters.quick === key ? "" : "secondary"}" data-quick="${key}">${esc(item.label)}</button>`).join("");
}

function timelineFilterPanel() {
  return `
    <div class="card" style="margin-bottom:18px">
      <h3>Filtre</h3>
      <div class="field"><label>Hurtigfiltre</label><div class="actions">${quickFilterButtons()}</div></div>
      <div class="row-4">
        <div class="field"><label>Søk</label><input id="filter-search" value="${esc(state.filters.search)}"></div>
        <div class="field"><label>Eventtype</label>
          <select id="filter-event-type">
            <option value="">Alle</option>
            ${EVENT_TYPES.map((t) => `<option value="${t}" ${state.filters.eventType === t ? "selected" : ""}>${esc(typeName(t))}</option>`).join("")}
          </select>
        </div>
        <div class="field"><label>Fra dato</label><input id="filter-from" type="date" value="${esc(state.filters.from)}"></div>
        <div class="field"><label>Til dato</label><input id="filter-to" type="date" value="${esc(state.filters.to)}"></div>
      </div>
    </div>
  `;
}

function isWithin(date, from, to) {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function eventMatchesQuick(event) {
  const preset = QUICK_FILTERS[state.filters.quick] || QUICK_FILTERS.all;
  return !preset.types.length || preset.types.includes(event.event_type);
}

function eventMatchesAdvanced(event) {
  if (state.filters.eventType && event.event_type !== state.filters.eventType) return false;
  if (!isWithin(event.start_date || "", state.filters.from, state.filters.to)) return false;
  const q = String(state.filters.search || "").trim().toLowerCase();
  if (!q) return true;
  const body = [event.title, event.notes, event.event_type, Object.values(event.data || {}).join(" ")].join(" ").toLowerCase();
  return body.includes(q);
}

function timelineEventRows(event) {
  const start = event.start_date;
  const end = event.end_date && event.end_date >= start ? event.end_date : "";
  const isMulti = Boolean(end && end > start);
  const rows = [];

  rows.push({
    date: start,
    kind: "start",
    headline: event.event_type === "accommodation" ? "Start / Check-in" : "Start",
    time: event.start_time || "",
    event,
  });

  if (isMulti) {
    let cursor = new Date(`${start}T00:00:00Z`);
    const endDate = new Date(`${end}T00:00:00Z`);
    while (true) {
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      const d = cursor.toISOString().slice(0, 10);
      if (d >= end) break;
      if (event.display_mode === "status") {
        rows.push({ date: d, kind: "status", headline: "Status", time: "", event });
      }
      if (cursor >= endDate) break;
    }

    rows.push({
      date: end,
      kind: "end",
      headline: event.event_type === "accommodation" ? "Slutt / Check-out" : "Slutt",
      time: event.end_time || "",
      event,
    });
  }

  return rows;
}

function timeline() {
  const events = itineraryEvents().filter((e) => eventMatchesQuick(e) && eventMatchesAdvanced(e));
  const rows = events.flatMap((e) => timelineEventRows(e));
  const groups = {};
  rows.forEach((r) => {
    if (!groups[r.date]) groups[r.date] = [];
    groups[r.date].push(r);
  });

  return `
    ${header("Plan", "Timeline", "Forenklet visning av hva, når og grunnleggende detaljer.", `<button id="open-create-event">Ny event</button>`)}
    ${timelineFilterPanel()}
    ${Object.keys(groups).sort().map((date) => `
      <div class="day-heading"><strong>${date}</strong><span>${dayHeaderStatus(groups[date])}</span></div>
      <div class="card">
        ${groups[date].filter((row) => row.kind !== "status").map((row) => occurrenceCard(row)).join("") || `<div class="empty">Kun status for denne dagen.</div>`}
      </div>
    `).join("") || `<div class="empty">Ingen events matcher filtrene.</div>`}
  `;
}

function dayHeaderStatus(rows) {
  const statuses = rows.filter((row) => row.kind === "status");
  if (!statuses.length) return `${rows.length} elementer`;
  return `${rows.filter((row) => row.kind !== "status").length} elementer · ${statuses.length} status`;
}

function basicEventDetails(event) {
  const d = event.data || {};
  const keys = ["location", "startLocation", "endLocation", "fromAirport", "toAirport", "booking", "subtype"];
  return keys.filter((k) => String(d[k] || "").trim()).map((k) => `<span class="badge">${esc(k)}: ${esc(String(d[k]))}</span>`).join(" ");
}

function occurrenceCard(row) {
  const e = row.event;
  return `
    <div class="event ${row.kind === "status" ? "event-continuation" : ""}">
      <div class="event-time">${esc(row.time ? row.time.slice(0, 5) : (row.kind === "status" ? "Status" : ""))}</div>
      <div class="event-body">
        <div class="event-title"><strong>${icon(e.event_type)} ${esc(e.title)}</strong><span class="badge">${esc(row.headline)}</span></div>
        <div class="event-meta">
          <div><b>Type:</b> ${esc(typeName(e.event_type))}</div>
          ${e.notes ? `<div><b>Notat:</b> ${esc(e.notes)}</div>` : ""}
        </div>
        <div class="tags">${basicEventDetails(e)}</div>
        <div class="actions"><button class="small secondary" data-edit-event="${e.id}">Rediger</button><button class="small danger" data-delete-event="${e.id}">Slett</button></div>
      </div>
    </div>
  `;
}

function routeNormalize(value) {
  return String(value || "").replace(/^via\s*:/i, "").trim();
}

function splitViaLocations(value) {
  return String(value || "")
    .split(/[;\n]/)
    .map((v) => routeNormalize(v))
    .filter(Boolean);
}

function drivePoints(event) {
  const d = event.data || {};
  const points = [routeNormalize(d.startLocation), ...splitViaLocations(d.viaLocations), routeNormalize(d.endLocation)].filter(Boolean);
  const compact = [];
  points.forEach((p) => {
    if (!compact.length || compact[compact.length - 1] !== p) compact.push(p);
  });
  return compact;
}

function mapSegments(points, maxPoints = 10) {
  if (points.length < 2) return [];
  const segments = [];
  for (let i = 0; i < points.length; i += maxPoints - 1) {
    const part = points.slice(i, i + maxPoints);
    if (part.length >= 2) segments.push(part);
  }
  return segments;
}

function googleMapsUrl(points) {
  const p = [...points];
  if (p.length < 2) return "";
  const params = new URLSearchParams({
    api: "1",
    origin: p[0],
    destination: p[p.length - 1],
    travelmode: "driving",
  });
  if (p.length > 2) params.set("waypoints", p.slice(1, -1).join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function roadtripPoints() {
  const drives = itineraryEvents().filter((e) => e.event_type === "drive");
  const out = [];
  drives.forEach((e) => {
    const points = drivePoints(e);
    if (!points.length) return;
    if (!out.length) {
      out.push(...points);
      return;
    }
    out.push(...points.slice(out[out.length - 1] === points[0] ? 1 : 0));
  });
  return out;
}

function driveEventsForDate(date) {
  return itineraryEvents().filter((e) => e.event_type === "drive" && e.start_date === date);
}

function routesTodayCard() {
  const today = new Date().toISOString().slice(0, 10);
  const drives = driveEventsForDate(today);
  const points = drives.flatMap((e) => drivePoints(e));
  const compact = points.filter((p, i) => i === 0 || p !== points[i - 1]);
  const url = googleMapsUrl(compact);
  return `
    <div class="card" style="margin-top:18px">
      <h3>I dag (${today})</h3>
      ${drives.length ? `<p class="muted">${drives.length} drive-events</p><div class="list">${drives.map((e) => `<div class="item"><div><strong>${esc(e.title)}</strong><br><span class="muted">${esc(drivePoints(e).join(" → "))}</span></div></div>`).join("")}</div>${url ? `<div class="actions" style="margin-top:12px"><a target="_blank" href="${esc(url)}"><button>Åpne rute</button></a></div>` : ""}` : `<div class="empty">Ingen drive-events i dag.</div>`}
    </div>
  `;
}

function routesPerDayCard() {
  const groups = {};
  itineraryEvents().filter((e) => e.event_type === "drive").forEach((e) => {
    (groups[e.start_date] ||= []).push(e);
  });

  return `
    <div class="card" style="margin-top:18px">
      <h3>Per dag</h3>
      <div class="list">
        ${Object.keys(groups).sort().map((day) => {
          const points = groups[day].flatMap((e) => drivePoints(e));
          const compact = points.filter((p, i) => i === 0 || p !== points[i - 1]);
          const url = googleMapsUrl(compact);
          return `<div class="item"><div><strong>${day}</strong><br><span class="muted">${compact.map(esc).join(" → ") || "Ingen stopp"}</span></div>${url ? `<a target="_blank" href="${esc(url)}"><button class="small secondary">Maps</button></a>` : ""}</div>`;
        }).join("") || `<div class="empty">Ingen drive-events.</div>`}
      </div>
    </div>
  `;
}

function routesRoadtripCard() {
  const points = roadtripPoints();
  const segments = mapSegments(points);
  return `
    <div class="card" style="margin-top:18px">
      <h3>Hele roadtripen</h3>
      ${points.length >= 2 ? `<p class="muted">${points.length} stopp · ${segments.length} Google Maps-segment(er)</p>
      <div class="list">${segments.map((segment, i) => `<div class="item"><div><strong>Segment ${i + 1}</strong><br><span class="muted">${segment.map(esc).join(" → ")}</span></div><a target="_blank" href="${esc(googleMapsUrl(segment))}"><button class="small secondary">Åpne</button></a></div>`).join("")}</div>` : `<div class="empty">Ingen komplett kjørerute ennå.</div>`}
    </div>
  `;
}

function routes() {
  return `
    ${header("Kart", "Routes", "Viser kun fysisk transport via drive-events.")}
    <div class="card"><div class="actions"><button class="small ${state.routesView === "today" ? "" : "secondary"}" data-routes-view="today">I dag</button><button class="small ${state.routesView === "day" ? "" : "secondary"}" data-routes-view="day">Per dag</button><button class="small ${state.routesView === "roadtrip" ? "" : "secondary"}" data-routes-view="roadtrip">Hele roadtripen</button></div></div>
    ${state.routesView === "today" ? routesTodayCard() : ""}
    ${state.routesView === "day" ? routesPerDayCard() : ""}
    ${state.routesView === "roadtrip" ? routesRoadtripCard() : ""}
  `;
}

function tripExportData() {
  return {
    trip: currentTrip(),
    events: state.events,
    documents: state.documents,
    packing: state.packing,
    budget: state.budget,
  };
}

function itineraryExportRows() {
  return itineraryEvents().flatMap((e) => timelineEventRows(e)).map((row) => ({
    date: row.date,
    kind: row.kind,
    title: row.event.title,
    event_type: row.event.event_type,
    display_mode: row.event.display_mode,
  }));
}

function downloadText(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportPage() {
  return `
    ${header("Eksport", "Export", "JSON, Markdown, PDF og reisedokument-eksport samlet på ett sted.")}
    <div class="card">
      <h3>Reiseplan</h3>
      <div class="actions">
        <button id="export-itinerary-json">Eksporter itinerary JSON</button>
        <button class="secondary" id="export-itinerary-markdown">Eksporter itinerary Markdown</button>
        <button class="secondary" id="export-trip-json">Eksporter full tur JSON</button>
      </div>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>Dokumenter</h3>
      <div class="actions">
        <button class="secondary" id="export-documents-markdown">Eksporter reisedokumentliste (Markdown)</button>
        <button class="secondary" id="export-documents-json">Eksporter reisedokumentliste (JSON)</button>
        <button class="secondary" id="export-pdf-placeholder">Lag PDF (nettleserutskrift)</button>
      </div>
    </div>
  `;
}

function documentsMarkdown() {
  const lines = ["# Reisedokumenter", "", `Tur: ${currentTrip()?.name || ""}`, ""];
  state.documents.forEach((d) => {
    lines.push(`- ${d.original_filename}${d.notes ? ` - ${d.notes}` : ""}`);
  });
  return lines.join("\n");
}

function documentsJson() {
  return JSON.stringify(state.documents, null, 2);
}

function documents() {
  return `
    ${header("Dokumenter", "Documents", "Last opp dokumenter og knytt dem til en event.")}
    <div class="card">
      <form id="doc-form" class="grid">
        <div class="row-3">
          <div class="field"><label>Event</label><select name="event_id"><option value="">Kun tur</option>${state.events.map((e) => `<option value="${e.id}">${esc(e.start_date)} - ${esc(e.title)}</option>`).join("")}</select></div>
          <div class="field"><label>Fil</label><input name="file" type="file" required></div>
          <div class="field"><label>Notat</label><input name="notes"></div>
        </div>
        <button>Last opp</button>
      </form>
    </div>
    <div class="card" style="margin-top:18px">
      <h3>Opplastede dokumenter</h3>
      <div class="list">${state.documents.map((d) => `<div class="item"><div><strong>${esc(d.original_filename)}</strong><br><span class="muted">${esc(d.notes || "")}${d.event_id ? ` · Event #${d.event_id}` : ""}</span></div><div class="actions"><a target="_blank" href="${esc(d.file_path)}"><button class="small secondary">Åpne</button></a><button class="small danger" data-delete-doc="${d.id}">Slett</button></div></div>`).join("") || `<div class="empty">Ingen dokumenter.</div>`}</div>
    </div>
  `;
}

function packingCategoryLabel(item) {
  return String(item?.category || "").trim() || "General";
}

function packingExportText() {
  const groups = {};
  state.packing.forEach((item) => {
    const cat = packingCategoryLabel(item);
    (groups[cat] ||= []).push(item);
  });
  const lines = ["Travel OS - Packing list", `Trip: ${currentTrip()?.name || ""}`, "", "Categories:"];
  Object.keys(groups).sort().forEach((cat) => {
    lines.push(`- ${cat}`);
    groups[cat].forEach((item) => lines.push(`  - [${Number(item.packed) ? "x" : " "}] ${item.item_text}${item.place ? ` (${item.place})` : ""}`));
  });
  return lines.join("\n");
}

function packing() {
  const categoryOptions = PACKING_CATEGORIES.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
  return `
    ${header("Utstyr", "Packing", "Pakkeliste lagret i database.")}
    <div class="card">
      <div class="row-3">
        <div class="field"><label>Ting</label><input id="pack-text"></div>
        <div class="field"><label>Kategori</label><select id="pack-category">${categoryOptions}</select></div>
        <div class="field"><label>Hvor</label><input id="pack-place"></div>
      </div>
      <div class="actions"><button id="add-pack">Legg til</button><button class="secondary" id="export-packing-list">Eksporter pakkeliste</button></div>
      <div class="list">${state.packing.map((p) => `<div class="item"><label><input type="checkbox" data-pack="${p.id}" ${Number(p.packed) ? "checked" : ""}> ${esc(p.item_text)} <span class="muted">· ${esc(p.place || "")}</span></label><div class="actions"><span class="badge">${esc(packingCategoryLabel(p))}</span><button class="small danger" data-delete-pack="${p.id}">Slett</button></div></div>`).join("")}</div>
    </div>
  `;
}

function budget() {
  const total = state.budget.reduce((a, b) => a + Number(b.amount || 0), 0);
  return `
    ${header("Budsjett", "Budget", `${total.toLocaleString("no-NO")} kr`)}
    <div class="card">
      <div class="row-3">
        <div class="field"><label>Kategori</label><input id="bud-cat"></div>
        <div class="field"><label>Navn</label><input id="bud-name"></div>
        <div class="field"><label>Beløp</label><input id="bud-amount" type="number"></div>
      </div>
      <button id="add-budget">Legg til</button>
      <table class="table"><tbody>${state.budget.map((b) => `<tr><td>${esc(b.category || "")}</td><td>${esc(b.item_name)}</td><td>${Number(b.amount || 0).toLocaleString("no-NO")} ${esc(b.currency)}</td><td><button class="small danger" data-delete-budget="${b.id}">Slett</button></td></tr>`).join("")}</tbody></table>
    </div>
  `;
}

function settings() {
  const t = currentTrip();
  return `
    ${header("Oppsett", "Settings", FEATURE_SAVED_VIEWS ? "Saved Views aktiv." : "Saved Views deaktivert via feature flag.")}
    <div class="grid cols-2">
      <div class="card">
        <h3>Turinfo</h3>
        <div class="field"><label>Navn</label><input id="trip-name" value="${esc(t?.name || "")}"></div>
        <div class="row"><div class="field"><label>Destinasjon</label><input id="trip-destination" value="${esc(t?.destination || "")}"></div><div></div></div>
        <div class="row"><div class="field"><label>Start</label><input id="trip-start" type="date" value="${esc(t?.start_date || "")}"></div><div class="field"><label>Slutt</label><input id="trip-end" type="date" value="${esc(t?.end_date || "")}"></div></div>
        <div class="field"><label>Notater</label><textarea id="trip-notes">${esc(t?.notes || "")}</textarea></div>
        <div class="actions"><button id="save-trip">Lagre</button><button class="danger" id="delete-trip">Slett tur</button></div>
      </div>
      <div class="card">
        <h3>Ny tur / import</h3>
        <div class="field"><label>Ny tur navn</label><input id="new-trip-name"></div>
        <button id="create-trip">Opprett tur</button>
        <hr>
        <div class="field"><label>Importer Travel OS JSON (legacy støttes)</label><textarea id="import-json"></textarea></div>
        <button id="import-json-btn">Importer som ny tur</button>
      </div>
    </div>
  `;
}

function newTripPage() {
  return `${header("Start", "Ingen tur valgt", "Opprett første tur.")}<div class="card"><div class="field"><label>Navn</label><input id="new-trip-name" value="Island 2026"></div><button id="create-trip">Opprett tur</button></div>`;
}

function eventModal() {
  if (!state.showCreateModal && !state.editEventId) return "";
  const existing = state.editEventId ? state.events.find((e) => Number(e.id) === Number(state.editEventId)) : null;
  const event = existing ? normalizeEvent(existing) : {
    event_type: "flight",
    title: "",
    start_date: currentTrip()?.start_date || new Date().toISOString().slice(0, 10),
    start_time: "09:00",
    end_date: "",
    end_time: "",
    display_mode: "timeline",
    notes: "",
    data: {},
  };

  const type = event.event_type;
  const fields = FIELD_SETS[type] || [];

  return `
    <div class="modal-backdrop" id="event-modal-close">
      <div class="modal" onclick="event.stopPropagation()">
        <h3>${existing ? "Rediger event" : "Ny event"}</h3>
        <div class="row-4">
          <div class="field"><label>Dato start</label><input id="ev-start-date" type="date" value="${esc(event.start_date)}"></div>
          <div class="field"><label>Tid start</label><input id="ev-start-time" type="time" value="${esc((event.start_time || "09:00").slice(0, 5))}"></div>
          <div class="field"><label>Type</label><select id="ev-type">${EVENT_TYPES.map((t) => `<option value="${t}" ${type === t ? "selected" : ""}>${esc(typeName(t))}</option>`).join("")}</select></div>
          <div class="field"><label>Visning</label><select id="ev-display-mode">${DISPLAY_MODE_OPTIONS.map(([value, label]) => `<option value="${value}" ${normalizeDisplayMode(event.display_mode, type) === value ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></div>
        </div>
        <div class="row">
          <div class="field"><label>Dato slutt</label><input id="ev-end-date" type="date" value="${esc(event.end_date)}"></div>
          <div class="field"><label>Tid slutt</label><input id="ev-end-time" type="time" value="${esc((event.end_time || "").slice(0, 5))}"></div>
        </div>
        <div class="field"><label>Tittel</label><input id="ev-title" value="${esc(event.title)}"></div>
        <div class="form-section"><div class="form-section-title">Felter for ${esc(typeName(type))}</div>${renderEventTypeFields(fields, event.data)}</div>
        <div class="field"><label>Notater</label><textarea id="ev-notes">${esc(event.notes || "")}</textarea></div>
        <div class="actions"><button id="save-event">${existing ? "Lagre" : "Opprett"}</button><button class="secondary" id="cancel-event">Avbryt</button></div>
      </div>
    </div>
  `;
}

function renderEventTypeFields(fields, data) {
  if (!fields.length) return `<div class="muted">Ingen spesialfelter.</div>`;
  return fields.map((f) => eventField(f, data[f[0]])).join("");
}

function eventField([key, label, type], value = "") {
  if (type === "textarea") return `<div class="field"><label>${esc(label)}</label><textarea data-field="${esc(key)}">${esc(value)}</textarea></div>`;
  return `<div class="field"><label>${esc(label)}</label><input data-field="${esc(key)}" type="${esc(type)}" value="${esc(value)}"></div>`;
}

function bind() {
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.onclick = () => {
      state.view = btn.dataset.view;
      render();
    };
  });

  const tripSelect = document.getElementById("trip-select");
  if (tripSelect) {
    tripSelect.onchange = async () => {
      state.currentTripId = Number(tripSelect.value);
      await loadTripData();
      render();
    };
  }

  document.querySelectorAll("[data-quick]").forEach((btn) => {
    btn.onclick = () => {
      state.filters.quick = btn.dataset.quick || "all";
      render();
    };
  });

  const search = document.getElementById("filter-search");
  if (search) search.oninput = () => {
    state.filters.search = search.value;
    render();
  };

  const type = document.getElementById("filter-event-type");
  if (type) type.onchange = () => {
    state.filters.eventType = type.value;
    render();
  };

  const from = document.getElementById("filter-from");
  if (from) from.onchange = () => {
    state.filters.from = from.value;
    render();
  };

  const to = document.getElementById("filter-to");
  if (to) to.onchange = () => {
    state.filters.to = to.value;
    render();
  };

  const openCreate = document.getElementById("open-create-event");
  if (openCreate) openCreate.onclick = () => {
    state.showCreateModal = true;
    state.editEventId = null;
    render();
  };

  const modalClose = document.getElementById("event-modal-close");
  if (modalClose) modalClose.onclick = () => {
    state.showCreateModal = false;
    state.editEventId = null;
    render();
  };

  const cancelEvent = document.getElementById("cancel-event");
  if (cancelEvent) cancelEvent.onclick = () => {
    state.showCreateModal = false;
    state.editEventId = null;
    render();
  };

  const evType = document.getElementById("ev-type");
  if (evType) evType.onchange = () => {
    // Re-open modal with selected type by toggling create mode and storing temporary id 0 path.
    const existing = state.editEventId ? state.events.find((e) => Number(e.id) === Number(state.editEventId)) : null;
    if (existing) existing.event_type = evType.value;
    else {
      const fake = {
        id: -1,
        event_type: evType.value,
        title: document.getElementById("ev-title")?.value || "",
        start_date: document.getElementById("ev-start-date")?.value || new Date().toISOString().slice(0, 10),
        start_time: document.getElementById("ev-start-time")?.value || "09:00",
        end_date: document.getElementById("ev-end-date")?.value || "",
        end_time: document.getElementById("ev-end-time")?.value || "",
        display_mode: document.getElementById("ev-display-mode")?.value || "timeline",
        notes: document.getElementById("ev-notes")?.value || "",
        data: {},
      };
      state.events = state.events.filter((e) => Number(e.id) !== -1);
      state.events.push(fake);
      state.editEventId = -1;
    }
    render();
  };

  const saveEvent = document.getElementById("save-event");
  if (saveEvent) saveEvent.onclick = saveEventHandler;

  document.querySelectorAll("[data-edit-event]").forEach((btn) => {
    btn.onclick = () => {
      state.editEventId = Number(btn.dataset.editEvent);
      state.showCreateModal = true;
      render();
    };
  });

  document.querySelectorAll("[data-delete-event]").forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm("Slette event?")) return;
      await api(`${API.events}?id=${Number(btn.dataset.deleteEvent)}`, { method: "DELETE" });
      await loadTripData();
      render();
    };
  });

  document.querySelectorAll("[data-routes-view]").forEach((btn) => {
    btn.onclick = () => {
      state.routesView = btn.dataset.routesView || "today";
      render();
    };
  });

  const docForm = document.getElementById("doc-form");
  if (docForm) docForm.onsubmit = uploadDoc;

  document.querySelectorAll("[data-delete-doc]").forEach((btn) => {
    btn.onclick = async () => {
      await api(`${API.documents}?id=${btn.dataset.deleteDoc}`, { method: "DELETE" });
      await loadTripData();
      render();
    };
  });

  const addPack = document.getElementById("add-pack");
  if (addPack) addPack.onclick = addPackingHandler;

  document.querySelectorAll("[data-pack]").forEach((checkbox) => {
    checkbox.onchange = async () => {
      const id = Number(checkbox.dataset.pack);
      const item = state.packing.find((x) => Number(x.id) === id);
      if (!item) return;
      await api(API.packing, {
        method: "PUT",
        body: JSON.stringify({ ...item, packed: checkbox.checked ? 1 : 0 }),
      });
      await loadTripData();
      render();
    };
  });

  document.querySelectorAll("[data-delete-pack]").forEach((btn) => {
    btn.onclick = async () => {
      await api(`${API.packing}?id=${btn.dataset.deletePack}`, { method: "DELETE" });
      await loadTripData();
      render();
    };
  });

  const exportPacking = document.getElementById("export-packing-list");
  if (exportPacking) exportPacking.onclick = () => downloadText(`${(currentTrip()?.name || "trip").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-packing-list.txt`, packingExportText());

  const addBudget = document.getElementById("add-budget");
  if (addBudget) addBudget.onclick = addBudgetHandler;

  document.querySelectorAll("[data-delete-budget]").forEach((btn) => {
    btn.onclick = async () => {
      await api(`${API.budget}?id=${btn.dataset.deleteBudget}`, { method: "DELETE" });
      await loadTripData();
      render();
    };
  });

  const saveTrip = document.getElementById("save-trip");
  if (saveTrip) saveTrip.onclick = saveTripHandler;

  const deleteTrip = document.getElementById("delete-trip");
  if (deleteTrip) deleteTrip.onclick = deleteTripHandler;

  const createTrip = document.getElementById("create-trip");
  if (createTrip) createTrip.onclick = createTripHandler;

  const importJson = document.getElementById("import-json-btn");
  if (importJson) importJson.onclick = importHandler;

  const exportItineraryJson = document.getElementById("export-itinerary-json");
  if (exportItineraryJson) exportItineraryJson.onclick = () => downloadText(`${(currentTrip()?.name || "trip").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-itinerary.json`, JSON.stringify(itineraryExportRows(), null, 2), "application/json;charset=utf-8");

  const exportItineraryMd = document.getElementById("export-itinerary-markdown");
  if (exportItineraryMd) exportItineraryMd.onclick = () => {
    const lines = ["# Itinerary", "", ...itineraryExportRows().map((r) => `- ${r.date} - ${r.title} (${r.kind})`)];
    downloadText(`${(currentTrip()?.name || "trip").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-itinerary.md`, lines.join("\n"));
  };

  const exportTrip = document.getElementById("export-trip-json");
  if (exportTrip) exportTrip.onclick = () => downloadText(`${(currentTrip()?.name || "trip").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-trip.json`, JSON.stringify(tripExportData(), null, 2), "application/json;charset=utf-8");

  const exportDocsMd = document.getElementById("export-documents-markdown");
  if (exportDocsMd) exportDocsMd.onclick = () => downloadText(`${(currentTrip()?.name || "trip").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-documents.md`, documentsMarkdown());

  const exportDocsJson = document.getElementById("export-documents-json");
  if (exportDocsJson) exportDocsJson.onclick = () => downloadText(`${(currentTrip()?.name || "trip").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-documents.json`, documentsJson(), "application/json;charset=utf-8");

  const exportPdf = document.getElementById("export-pdf-placeholder");
  if (exportPdf) exportPdf.onclick = () => window.print();
}

function value(id) {
  return document.getElementById(id)?.value || "";
}

async function saveEventHandler() {
  const data = {};
  document.querySelectorAll("[data-field]").forEach((el) => {
    data[el.dataset.field] = el.value;
  });

  const payload = {
    trip_id: state.currentTripId,
    id: state.editEventId && state.editEventId > 0 ? state.editEventId : null,
    event_type: value("ev-type") || "special",
    title: value("ev-title") || "Event",
    start_date: value("ev-start-date") || new Date().toISOString().slice(0, 10),
    start_time: value("ev-start-time") || null,
    end_date: value("ev-end-date") || null,
    end_time: value("ev-end-time") || null,
    display_mode: normalizeDisplayMode(value("ev-display-mode"), value("ev-type")),
    notes: value("ev-notes") || null,
    data,
  };

  if ((payload.event_type === "accommodation" || payload.event_type === "special") && !String(payload.data.subtype || "").trim()) {
    payload.data.subtype = payload.event_type === "accommodation" ? "general" : "other";
  }

  await api(API.events, {
    method: payload.id ? "PUT" : "POST",
    body: JSON.stringify(payload),
  });

  state.showCreateModal = false;
  state.editEventId = null;
  state.events = state.events.filter((e) => Number(e.id) !== -1);
  await loadTripData();
  render();
}

async function uploadDoc(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  formData.append("trip_id", state.currentTripId);
  await api(API.documents, { method: "POST", body: formData });
  await loadTripData();
  render();
}

async function addPackingHandler() {
  await api(API.packing, {
    method: "POST",
    body: JSON.stringify({
      trip_id: state.currentTripId,
      item_text: value("pack-text") || "Item",
      category: value("pack-category") || "General",
      place: value("pack-place") || "",
      packed: 0,
    }),
  });
  await loadTripData();
  render();
}

async function addBudgetHandler() {
  await api(API.budget, {
    method: "POST",
    body: JSON.stringify({
      trip_id: state.currentTripId,
      category: value("bud-cat") || "General",
      item_name: value("bud-name") || "Item",
      amount: Number(value("bud-amount") || 0),
      currency: "NOK",
      paid: 0,
    }),
  });
  await loadTripData();
  render();
}

async function saveTripHandler() {
  const trip = currentTrip();
  if (!trip) return;
  await api(API.trips, {
    method: "PUT",
    body: JSON.stringify({
      id: trip.id,
      name: value("trip-name") || "Ny tur",
      destination: value("trip-destination") || null,
      start_date: value("trip-start") || null,
      end_date: value("trip-end") || null,
      notes: value("trip-notes") || null,
    }),
  });
  state.trips = await api(API.trips);
  await loadTripData();
  render();
}

async function createTripHandler() {
  const name = value("new-trip-name") || "Ny tur";
  const res = await api(API.trips, { method: "POST", body: JSON.stringify({ name }) });
  state.trips = await api(API.trips);
  state.currentTripId = res.id;
  await loadTripData();
  render();
}

async function deleteTripHandler() {
  if (!confirm("Slette hele turen med events og dokumentreferanser?")) return;
  await api(`${API.trips}?id=${state.currentTripId}`, { method: "DELETE" });
  state.trips = await api(API.trips);
  state.currentTripId = state.trips[0]?.id || null;
  if (state.currentTripId) await loadTripData();
  render();
}

async function importHandler() {
  const raw = value("import-json");
  if (!raw.trim()) return;
  const parsed = JSON.parse(raw);
  const result = await api(API.import, { method: "POST", body: JSON.stringify(parsed) });
  state.trips = await api(API.trips);
  state.currentTripId = result.trip_id;
  await loadTripData();
  state.view = "timeline";
  render();
}

async function init() {
  state.trips = await api(API.trips);
  state.currentTripId = Number(localStorage.getItem("travel_os_current_trip")) || state.trips[0]?.id || null;
  if (state.currentTripId) await loadTripData();
  render();
}

init().catch((err) => {
  document.getElementById("app").innerHTML = `<main class="login-card"><h1>Feil</h1><p>${esc(err.message)}</p><p>Sjekk config.php og database.</p></main>`;
});
