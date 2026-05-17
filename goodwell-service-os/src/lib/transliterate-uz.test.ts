import { describe, it, expect } from "vitest";
import { transliterateLatnToCyrl } from "./transliterate-uz";

describe("transliterateLatnToCyrl", () => {
  it("handles O' (apostrophe-Ў)", () => {
    expect(transliterateLatnToCyrl("O'zbekcha")).toBe("Ўзбекча");
  });
  it("transliterates a simple sentence", () => {
    expect(transliterateLatnToCyrl("Salom dunyo")).toBe("Салом дунё");
  });
  it("preserves digits and punctuation", () => {
    expect(transliterateLatnToCyrl("+998 90 123 45 67")).toBe("+998 90 123 45 67");
  });
  it("returns empty string unchanged", () => {
    expect(transliterateLatnToCyrl("")).toBe("");
  });
  it("preserves uppercase", () => {
    expect(transliterateLatnToCyrl("SALOM")).toBe("САЛОМ");
  });
  it("translates UI labels we will use in messages", () => {
    expect(transliterateLatnToCyrl("Kirish")).toBe("Кириш");
    expect(transliterateLatnToCyrl("Chiqish")).toBe("Чиқиш");
    expect(transliterateLatnToCyrl("Sozlamalar")).toBe("Созламалар");
  });
  it("maps digraphs before singles (sh, ch, ng)", () => {
    expect(transliterateLatnToCyrl("shahar")).toBe("шаҳар");
    expect(transliterateLatnToCyrl("chiroq")).toBe("чироқ");
  });
});
