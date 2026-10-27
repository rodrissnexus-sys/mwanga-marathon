import { describe, expect, it } from "vitest";
import { parseDump } from "../../scripts/import-mysql/parse-dump.mjs";

describe("parseDump", () => {
  it("reads phpMyAdmin inserts with column lists and MySQL escapes", () => {
    const sql = `INSERT INTO \`registrations\` (\`id\`, \`first_name\`, \`payment_notes\`, \`deleted_at\`) VALUES
(1, 'Zoë', 'Paid via M-Pesa\\nRef: \\"ABC\\'123\\"', NULL),
(2, 'O''Neil', 'semi;colon, (paren)', '2025-05-05 10:00:00');`;
    expect(parseDump(sql).registrations).toEqual([
      { id: 1, first_name: "Zoë", payment_notes: 'Paid via M-Pesa\nRef: "ABC\'123"', deleted_at: null },
      { id: 2, first_name: "O'Neil", payment_notes: "semi;colon, (paren)", deleted_at: "2025-05-05 10:00:00" },
    ]);
  });

  it("uses CREATE TABLE column names for mysqldump inserts without a column list", () => {
    const sql = `CREATE TABLE \`genders\` (
  \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
  \`name\` varchar(255) NOT NULL,
  \`code\` varchar(255) NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB;
INSERT INTO \`genders\` VALUES (1,'Mwanaume','M'),(2,'Mwanamke','F');`;
    expect(parseDump(sql).genders).toEqual([
      { id: 1, name: "Mwanaume", code: "M" },
      { id: 2, name: "Mwanamke", code: "F" },
    ]);
  });

  it("rejects rows that don't match the columns", () => {
    expect(() => parseDump("INSERT INTO `t` (`a`, `b`) VALUES (1);")).toThrow(/1 values for 2 columns/);
  });
});
