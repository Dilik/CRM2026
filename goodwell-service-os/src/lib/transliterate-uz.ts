const DIGRAPHS: Array<[string, string]> = [
  ["sh", "ш"], ["Sh", "Ш"], ["SH", "Ш"],
  ["ch", "ч"], ["Ch", "Ч"], ["CH", "Ч"],
  ["yo", "ё"], ["Yo", "Ё"], ["YO", "Ё"],
  ["yu", "ю"], ["Yu", "Ю"], ["YU", "Ю"],
  ["ya", "я"], ["Ya", "Я"], ["YA", "Я"],
  ["ye", "е"], ["Ye", "Е"], ["YE", "Е"],
  ["ng", "нг"], ["Ng", "Нг"], ["NG", "НГ"],
  ["o'", "ў"], ["O'", "Ў"],
  ["oʼ", "ў"], ["Oʼ", "Ў"],
  ["g'", "ғ"], ["G'", "Ғ"],
  ["gʼ", "ғ"], ["Gʼ", "Ғ"],
];

const SINGLES: Record<string, string> = {
  a: "а", b: "б", d: "д", e: "е", f: "ф", g: "г", h: "ҳ", i: "и",
  j: "ж", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ",
  r: "р", s: "с", t: "т", u: "у", v: "в", x: "х", y: "й", z: "з",
  A: "А", B: "Б", D: "Д", E: "Е", F: "Ф", G: "Г", H: "Ҳ", I: "И",
  J: "Ж", K: "К", L: "Л", M: "М", N: "Н", O: "О", P: "П", Q: "Қ",
  R: "Р", S: "С", T: "Т", U: "У", V: "В", X: "Х", Y: "Й", Z: "З",
  c: "ц", C: "Ц", w: "в", W: "В",
};

export function transliterateLatnToCyrl(input: string): string {
  if (!input) return input;
  let out = input;
  for (const [latin, cyrl] of DIGRAPHS) {
    const re = new RegExp(latin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    out = out.replace(re, cyrl);
  }
  out = out.replace(/[a-zA-Z]/g, (ch) => SINGLES[ch] ?? ch);
  return out;
}
