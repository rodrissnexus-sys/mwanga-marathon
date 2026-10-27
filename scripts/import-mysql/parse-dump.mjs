// Reads the rows out of a MySQL dump (phpMyAdmin "Quick" export or mysqldump).
// Only CREATE TABLE (for column names) and INSERT statements are used.

const ESCAPES = { 0: "\0", b: "\b", n: "\n", r: "\r", t: "\t", Z: "\x1a", "\\": "\\", "'": "'", '"': '"' };

/** Column names of every CREATE TABLE in the dump. */
function readColumns(sql) {
  const tables = {};
  const createRe = /CREATE TABLE (?:IF NOT EXISTS )?`(\w+)`\s*\(([\s\S]*?)\n\)\s*(?:ENGINE|;)/g;
  for (const [, table, body] of sql.matchAll(createRe)) {
    tables[table] = [...body.matchAll(/^\s*`(\w+)`\s+\w/gm)].map((m) => m[1]);
  }
  return tables;
}

/**
 * Parses the VALUES list that starts at `pos`. Returns the rows (arrays of
 * values) and the position after the closing `;`.
 */
function readValues(sql, pos) {
  const rows = [];
  let row = null;
  let i = pos;

  const skipSpace = () => {
    while (i < sql.length && /\s/.test(sql[i])) i++;
  };

  for (;;) {
    skipSpace();
    const ch = sql[i];
    if (ch === ";") return { rows, end: i + 1 };
    if (ch === ",") {
      i++;
      continue;
    }
    if (ch === "(" && row === null) {
      row = [];
      i++;
      continue;
    }
    if (ch === ")" && row !== null) {
      rows.push(row);
      row = null;
      i++;
      continue;
    }
    if (row === null) throw new Error(`Unexpected "${sql.slice(i, i + 20)}" in VALUES at ${i}`);

    if (ch === "'") {
      // quoted string: backslash escapes and doubled quotes
      let out = "";
      i++;
      for (;;) {
        const c = sql[i];
        if (c === undefined) throw new Error("Unterminated string in dump");
        if (c === "\\") {
          const next = sql[i + 1];
          out += ESCAPES[next] ?? next;
          i += 2;
        } else if (c === "'" && sql[i + 1] === "'") {
          out += "'";
          i += 2;
        } else if (c === "'") {
          i++;
          break;
        } else {
          out += c;
          i++;
        }
      }
      row.push(out);
    } else {
      const m = /^(NULL|-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?|0x[0-9a-fA-F]+|TRUE|FALSE)/i.exec(sql.slice(i, i + 64));
      if (!m) throw new Error(`Unknown value "${sql.slice(i, i + 20)}" at ${i}`);
      const token = m[1];
      i += token.length;
      if (/^NULL$/i.test(token)) row.push(null);
      else if (/^TRUE$/i.test(token)) row.push(1);
      else if (/^FALSE$/i.test(token)) row.push(0);
      else if (token.startsWith("0x")) row.push(Buffer.from(token.slice(2), "hex").toString("utf8"));
      else row.push(Number(token));
    }
  }
}

/**
 * @param {string} sql - contents of the dump file
 * @returns {Record<string, Record<string, unknown>[]>} rows per table, as objects
 */
export function parseDump(sql) {
  const columns = readColumns(sql);
  const data = {};
  const insertRe = /INSERT (?:IGNORE )?INTO `(\w+)`\s*(?:\(([^)]*)\))?\s*VALUES\s*/g;

  let match;
  while ((match = insertRe.exec(sql))) {
    const [, table, columnList] = match;
    const names = columnList ? [...columnList.matchAll(/`(\w+)`/g)].map((m) => m[1]) : columns[table];
    if (!names) throw new Error(`No column names for table ${table}`);

    const { rows, end } = readValues(sql, insertRe.lastIndex);
    for (const values of rows) {
      if (values.length !== names.length) {
        throw new Error(`${table}: row has ${values.length} values for ${names.length} columns`);
      }
      (data[table] ??= []).push(Object.fromEntries(names.map((name, k) => [name, values[k]])));
    }
    insertRe.lastIndex = end;
  }
  return data;
}
