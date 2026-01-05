/**
 * Google Sheets storage for SevaConnect.
 *
 * Data model (tabs):
 * - People
 * - Sevas
 * - Schedule
 *
 * Each tab has a header row. Deletes are soft (deletedAt).
 */

var SHEET_NAMES_ = {
  PEOPLE: "People",
  SEVAS: "Sevas",
  SCHEDULE: "Schedule"
};

var HEADERS_ = {};
HEADERS_[SHEET_NAMES_.PEOPLE] = [
  "id",
  "fullName",
  "email",
  "mobile",
  "preferredChannel",
  "active",
  "createdAt",
  "updatedAt",
  "deletedAt"
];

HEADERS_[SHEET_NAMES_.SEVAS] = [
  "id",
  "name",
  "description",
  "defaultDurationMinutes",
  "defaultStartTime",
  "color",
  "createdAt",
  "updatedAt",
  "deletedAt"
];

HEADERS_[SHEET_NAMES_.SCHEDULE] = [
  "id",
  "groupId",
  "date",
  "startTime",
  "endTime",
  "sevaId",
  "personId",
  "status",
  "createdAt",
  "updatedAt",
  "deletedAt"
];

/**
 * One-time initializer: creates spreadsheet (optional) and tabs.
 *
 * If SCRIPT_PROPERTIES.SPREADSHEET_ID is empty, it will create a new sheet and
 * store the ID back into script properties.
 *
 * Run manually from the Apps Script editor.
 */
function init() {
  var props = PropertiesService.getScriptProperties();
  var spreadsheetId = props.getProperty("SPREADSHEET_ID");

  var ss;
  if (spreadsheetId) {
    ss = SpreadsheetApp.openById(spreadsheetId);
  } else {
    ss = SpreadsheetApp.create("SevaConnect DB");
    props.setProperty("SPREADSHEET_ID", ss.getId());
  }

  Object.keys(HEADERS_).forEach(function (name) {
    var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    ensureHeader_(sheet, HEADERS_[name]);
  });

  return ok_({ spreadsheetId: ss.getId(), url: ss.getUrl() });
}

/**
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getDb_() {
  var spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!spreadsheetId) throw new Error("Missing SPREADSHEET_ID. Run init() first.");
  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * @param {string} sheetName
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getSheet_(sheetName) {
  var ss = getDb_();
  var sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error("Missing sheet: " + sheetName + ". Run init() first.");
  ensureHeader_(sh, HEADERS_[sheetName]);
  return sh;
}

/**
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {string[]} headers
 */
function ensureHeader_(sheet, headers) {
  var range = sheet.getRange(1, 1, 1, headers.length);
  var values = range.getValues();
  var current = values && values[0] ? values[0].map(String) : [];
  var mismatch = current.length !== headers.length;
  for (var i = 0; i < headers.length && !mismatch; i++) {
    if (current[i] !== headers[i]) mismatch = true;
  }
  if (mismatch) {
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }
}

/**
 * @param {string} sheetName
 * @returns {Array<Object<string, any>>}
 */
function listRows_(sheetName) {
  var sh = getSheet_(sheetName);
  var dataRange = sh.getDataRange();
  var values = dataRange.getValues();
  if (values.length <= 1) return [];

  var headers = values[0].map(String);
  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (row.join("").trim() === "") continue;
    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c];
    }
    // soft-delete filter
    if (obj.deletedAt) continue;
    rows.push(obj);
  }
  return rows;
}

/**
 * @param {string} sheetName
 * @param {string} id
 * @returns {{rowIndex: number, headers: string[], values: any[]}|null}
 */
function findById_(sheetName, id) {
  var sh = getSheet_(sheetName);
  var dataRange = sh.getDataRange();
  var values = dataRange.getValues();
  if (values.length <= 1) return null;

  var headers = values[0].map(String);
  var idCol = headers.indexOf("id");
  if (idCol === -1) throw new Error("Sheet missing 'id' column: " + sheetName);

  for (var r = 1; r < values.length; r++) {
    if (String(values[r][idCol]) === String(id)) {
      return { rowIndex: r + 1, headers: headers, values: values[r] };
    }
  }
  return null;
}

/**
 * @param {string} sheetName
 * @param {Object<string, any>} record
 * @returns {Object<string, any>} stored
 */
function createRow_(sheetName, record) {
  var sh = getSheet_(sheetName);
  var headers = HEADERS_[sheetName];
  var now = new Date().toISOString();

  var stored = Object.assign({}, record);
  if (!stored.id) stored.id = Utilities.getUuid();
  stored.createdAt = stored.createdAt || now;
  stored.updatedAt = now;
  stored.deletedAt = "";

  var row = headers.map(function (h) {
    return stored[h] !== undefined ? stored[h] : "";
  });
  sh.appendRow(row);
  return stored;
}

/**
 * @param {string} sheetName
 * @param {string} id
 * @param {Object<string, any>} patch
 * @returns {Object<string, any>} stored
 */
function updateRow_(sheetName, id, patch) {
  var sh = getSheet_(sheetName);
  var found = findById_(sheetName, id);
  if (!found) throw new Error("Not found: " + sheetName + " id=" + id);

  var headers = found.headers;
  var rowValues = found.values.slice();
  var now = new Date().toISOString();

  Object.keys(patch || {}).forEach(function (k) {
    var idx = headers.indexOf(k);
    if (idx === -1) return;
    rowValues[idx] = patch[k];
  });

  var updatedAtIdx = headers.indexOf("updatedAt");
  if (updatedAtIdx !== -1) rowValues[updatedAtIdx] = now;

  sh.getRange(found.rowIndex, 1, 1, headers.length).setValues([rowValues]);

  var stored = {};
  for (var i = 0; i < headers.length; i++) stored[headers[i]] = rowValues[i];
  return stored;
}

/**
 * Soft delete by setting deletedAt.
 * @param {string} sheetName
 * @param {string} id
 * @returns {{id: string, deletedAt: string}}
 */
function deleteRow_(sheetName, id) {
  var now = new Date().toISOString();
  updateRow_(sheetName, id, { deletedAt: now });
  return { id: String(id), deletedAt: now };
}

