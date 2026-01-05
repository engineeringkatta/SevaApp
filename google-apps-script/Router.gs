/**
 * Web app entrypoints + router.
 *
 * Query params:
 * - resource: health | people | sevas | schedule
 * - action (POST): create | update | delete | createMany | updateStatus
 * - token (POST or GET): optional shared-secret for writes (recommended)
 *
 * Notes on browser calls:
 * - Apps Script web apps do NOT reliably emit CORS headers.
 * - To avoid preflight, send POST with `Content-Type: text/plain` and a JSON string body.
 * - For GET, you may use JSONP via `callback=` if needed.
 */

/**
 * @param {GoogleAppsScript.Events.DoGet} e
 */
function doGet(e) {
  var req = parseRequest_(e);
  return jsonResponse_(handleGet_(req), req.query);
}

/**
 * @param {GoogleAppsScript.Events.DoPost} e
 */
function doPost(e) {
  var req = parseRequest_(e);
  return jsonResponse_(handlePost_(req), req.query);
}

/**
 * @param {{query: Object<string, string>, body: any, rawBody: string}} req
 */
function handleGet_(req) {
  try {
    var resource = (req.query.resource || "health").toLowerCase();

    if (resource === "health") {
      return ok_({
        service: "sevaconnect-google-apps-script",
        time: new Date().toISOString()
      });
    }

    if (resource === "people") {
      return ok_(listRows_(SHEET_NAMES_.PEOPLE));
    }

    if (resource === "sevas") {
      return ok_(listRows_(SHEET_NAMES_.SEVAS));
    }

    if (resource === "schedule") {
      var all = listRows_(SHEET_NAMES_.SCHEDULE);
      var from = req.query.from ? String(req.query.from) : "";
      var to = req.query.to ? String(req.query.to) : "";
      if (from) all = all.filter(function (r) { return String(r.date) >= from; });
      if (to) all = all.filter(function (r) { return String(r.date) <= to; });
      all.sort(function (a, b) {
        return String(a.date).localeCompare(String(b.date)) || String(a.startTime).localeCompare(String(b.startTime));
      });
      return ok_(all);
    }

    return error_("Unknown resource", { resource: resource });
  } catch (err) {
    return error_("GET failed", { details: String(err && err.message ? err.message : err) });
  }
}

/**
 * @param {{query: Object<string, string>, body: any, rawBody: string}} req
 */
function handlePost_(req) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    requireWriteAuth_(req);

    var resource = (req.query.resource || req.body.resource || "").toLowerCase();
    var action = (req.query.action || req.body.action || "").toLowerCase();
    var body = req.body || {};

    if (!resource) return error_("Missing resource");
    if (!action) return error_("Missing action");

    if (resource === "people") {
      if (action === "create") return ok_(createRow_(SHEET_NAMES_.PEOPLE, normalizePerson_(body)));
      if (action === "update") return ok_(updateRow_(SHEET_NAMES_.PEOPLE, String(body.id), normalizePersonPatch_(body)));
      if (action === "delete") return ok_(deleteRow_(SHEET_NAMES_.PEOPLE, String(body.id)));
      return error_("Unknown action", { resource: resource, action: action });
    }

    if (resource === "sevas") {
      if (action === "create") return ok_(createRow_(SHEET_NAMES_.SEVAS, normalizeSeva_(body)));
      if (action === "update") return ok_(updateRow_(SHEET_NAMES_.SEVAS, String(body.id), normalizeSevaPatch_(body)));
      if (action === "delete") return ok_(deleteRow_(SHEET_NAMES_.SEVAS, String(body.id)));
      return error_("Unknown action", { resource: resource, action: action });
    }

    if (resource === "schedule") {
      if (action === "createmany") {
        var entries = body.entries || body.items || [];
        if (!Array.isArray(entries) || entries.length === 0) return error_("Missing entries[]");
        var created = entries.map(function (e) {
          return createRow_(SHEET_NAMES_.SCHEDULE, normalizeSchedule_(e));
        });
        return ok_(created);
      }
      if (action === "updatestatus") {
        if (!body.id) return error_("Missing id");
        if (!body.status) return error_("Missing status");
        return ok_(updateRow_(SHEET_NAMES_.SCHEDULE, String(body.id), { status: String(body.status) }));
      }
      if (action === "update") {
        if (!body.id) return error_("Missing id");
        return ok_(updateRow_(SHEET_NAMES_.SCHEDULE, String(body.id), normalizeSchedulePatch_(body)));
      }
      if (action === "delete") return ok_(deleteRow_(SHEET_NAMES_.SCHEDULE, String(body.id)));
      return error_("Unknown action", { resource: resource, action: action });
    }

    return error_("Unknown resource", { resource: resource });
  } catch (err) {
    return error_("POST failed", { details: String(err && err.message ? err.message : err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Shared-secret write auth (recommended for public web apps).
 * Set Script Property: API_TOKEN
 *
 * @param {{query: Object<string, string>, body: any}} req
 */
function requireWriteAuth_(req) {
  var expected = PropertiesService.getScriptProperties().getProperty("API_TOKEN");
  if (!expected) {
    // If no token configured, allow writes (developer convenience).
    // Strongly recommended to set API_TOKEN in production.
    return;
  }

  var provided = (req.query.token || (req.body && req.body.token) || "");
  if (String(provided) !== String(expected)) {
    throw new Error("Unauthorized (invalid token)");
  }
}

/**
 * @param {any} body
 */
function normalizePerson_(body) {
  if (!body.fullName) throw new Error("Missing fullName");
  if (!body.email) throw new Error("Missing email");
  if (!body.mobile) throw new Error("Missing mobile");
  return {
    id: body.id,
    fullName: String(body.fullName),
    email: String(body.email),
    mobile: String(body.mobile),
    preferredChannel: String(body.preferredChannel || "WHATSAPP"),
    active: body.active === false ? false : true
  };
}

function normalizePersonPatch_(body) {
  if (!body.id) throw new Error("Missing id");
  var patch = {};
  ["fullName", "email", "mobile", "preferredChannel", "active"].forEach(function (k) {
    if (body[k] !== undefined) patch[k] = body[k];
  });
  return patch;
}

function normalizeSeva_(body) {
  if (!body.name) throw new Error("Missing name");
  var duration = body.defaultDurationMinutes;
  if (duration === undefined || duration === null || duration === "") throw new Error("Missing defaultDurationMinutes");
  return {
    id: body.id,
    name: String(body.name),
    description: String(body.description || ""),
    defaultDurationMinutes: Number(duration),
    defaultStartTime: body.defaultStartTime ? String(body.defaultStartTime) : "",
    color: String(body.color || "bg-orange-100")
  };
}

function normalizeSevaPatch_(body) {
  if (!body.id) throw new Error("Missing id");
  var patch = {};
  ["name", "description", "defaultDurationMinutes", "defaultStartTime", "color"].forEach(function (k) {
    if (body[k] !== undefined) patch[k] = body[k];
  });
  return patch;
}

function normalizeSchedule_(body) {
  if (!body.date) throw new Error("Missing date");
  if (!body.startTime) throw new Error("Missing startTime");
  if (!body.endTime) throw new Error("Missing endTime");
  if (!body.sevaId) throw new Error("Missing sevaId");
  if (!body.personId) throw new Error("Missing personId");
  return {
    id: body.id,
    groupId: body.groupId ? String(body.groupId) : "",
    date: String(body.date),
    startTime: String(body.startTime),
    endTime: String(body.endTime),
    sevaId: String(body.sevaId),
    personId: String(body.personId),
    status: String(body.status || "SCHEDULED")
  };
}

function normalizeSchedulePatch_(body) {
  if (!body.id) throw new Error("Missing id");
  var patch = {};
  ["groupId", "date", "startTime", "endTime", "sevaId", "personId", "status"].forEach(function (k) {
    if (body[k] !== undefined) patch[k] = body[k];
  });
  return patch;
}

