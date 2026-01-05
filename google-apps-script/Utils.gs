/**
 * Utility helpers for request parsing + responses.
 */

/**
 * @param {GoogleAppsScript.Events.DoGet|GoogleAppsScript.Events.DoPost} e
 * @returns {{query: Object<string, string>, body: any, rawBody: string}}
 */
function parseRequest_(e) {
  /** @type {Object<string, string>} */
  var query = {};

  if (e && e.parameter) {
    Object.keys(e.parameter).forEach(function (k) {
      query[k] = String(e.parameter[k]);
    });
  }

  var rawBody = "";
  if (e && e.postData && e.postData.contents) {
    rawBody = String(e.postData.contents);
  }

  // Allow body to be either JSON or a plain text JSON string.
  // If Content-Type is application/x-www-form-urlencoded, Apps Script typically populates e.parameter.
  var body = null;
  if (rawBody) {
    body = tryParseJson_(rawBody);
    if (body === null) {
      // Support "payload=<json>" pattern (common to avoid preflight).
      var match = rawBody.match(/(?:^|&)payload=([^&]+)(?:&|$)/);
      if (match && match[1]) {
        var decoded = decodeURIComponent(match[1].replace(/\+/g, "%20"));
        body = tryParseJson_(decoded);
      }
    }
  }

  if (body === null && query.payload) {
    body = tryParseJson_(query.payload);
  }

  // Last resort: use query as body for simple calls.
  if (body === null) body = {};

  return { query: query, body: body, rawBody: rawBody };
}

/**
 * @param {string} s
 * @returns {any|null}
 */
function tryParseJson_(s) {
  try {
    return JSON.parse(s);
  } catch (err) {
    return null;
  }
}

/**
 * @param {any} data
 * @param {Object<string, string>=} optQuery
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function jsonResponse_(data, optQuery) {
  var query = optQuery || {};
  var text = JSON.stringify(data);

  // Optional JSONP for GET requests to bypass CORS if needed.
  // Example: ?resource=people&callback=handleResponse
  if (query.callback) {
    return ContentService
      .createTextOutput(String(query.callback) + "(" + text + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * @param {string} msg
 * @param {Object<string, any>=} extra
 */
function error_(msg, extra) {
  var err = { ok: false, error: String(msg) };
  if (extra) {
    Object.keys(extra).forEach(function (k) { err[k] = extra[k]; });
  }
  return err;
}

/**
 * @param {any} data
 */
function ok_(data) {
  return { ok: true, data: data };
}

