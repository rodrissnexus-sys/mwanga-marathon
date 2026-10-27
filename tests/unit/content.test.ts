import { describe, expect, it } from "vitest";
import { localize, toLocaleColumns } from "@/lib/content";

describe("localize", () => {
  const row = {
    id: 1,
    title_en: "Marathon",
    title_sw: "Mbio ndefu",
    subtitle_en: "42 km",
    subtitle_sw: null,
    features: [{ text_en: "Medal", text_sw: "" }],
  };

  it("uses Swahili when present and falls back to English", () => {
    const sw = localize(row, "sw");
    expect(sw.title).toBe("Mbio ndefu");
    expect(sw.subtitle).toBe("42 km");
    expect(sw.features[0].text).toBe("Medal");
  });

  it("uses English on English pages and keeps the original columns", () => {
    const en = localize(row, "en");
    expect(en.title).toBe("Marathon");
    expect(en.title_sw).toBe("Mbio ndefu");
  });

  it("treats an empty Swahili list as missing", () => {
    expect(localize({ features_en: ["a"], features_sw: [] }, "sw").features).toEqual(["a"]);
  });
});

describe("toLocaleColumns", () => {
  it("writes only the edited language for existing rows", () => {
    expect(toLocaleColumns({ title: "Siku 1", icon: "x" }, ["title"], { locale: "sw" })).toEqual({ title_sw: "Siku 1" });
  });

  it("also fills English when a row is created in Swahili", () => {
    expect(toLocaleColumns({ title: "Siku 1" }, ["title"], { locale: "sw", isNew: true })).toEqual({
      title_sw: "Siku 1",
      title_en: "Siku 1",
    });
  });
});
