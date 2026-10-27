#!/usr/bin/env python3
"""One-off helper used while porting: moves hard-coded strings out of a
component into messages/{en,sw}/<namespace>.json and replaces them with
next-intl calls.

Usage: python3 scripts/i18n-extract.py spec.json

Spec:
{
  "file": "src/views/home/components/AboutSection.jsx",
  "ns": "home",               # messages/<locale>/home.json
  "prefix": "about",          # keys nested under this prefix (optional)
  "tvar": "t",                # translator variable name (default "t")
  "hooks": ["AboutSection"],  # components that get `const t = useTranslations(...)`
  "items": [
    [mode, find, key, sw, en?]
      text   : JSX text                   -> {t("key")}
      quoted : "..." or '...' literal     -> t("key")
      attr   : attr="..."                 -> attr={t("key")}
    `find` must match the source exactly; every occurrence is replaced.
  ]
}
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def set_key(tree, dotted, value):
    parts = dotted.split(".")
    for part in parts[:-1]:
        tree = tree.setdefault(part, {})
    if parts[-1] in tree and tree[parts[-1]] != value:
        raise SystemExit(f"key clash {dotted}: {tree[parts[-1]]!r} vs {value!r}")
    tree[parts[-1]] = value


def squash(text):
    return re.sub(r"\s+", " ", text).strip()


def unquote(literal):
    body = literal[1:-1]
    if literal[0] == "'":
        body = body.replace("\\'", "'")
    return body.replace('\\"', '"')


def main(spec_path):
    spec = json.loads(Path(spec_path).read_text())
    src_path = ROOT / spec["file"]
    src = src_path.read_text()
    ns, prefix, tv = spec["ns"], spec.get("prefix"), spec.get("tvar", "t")

    msgs = {}
    for loc in ("en", "sw"):
        path = ROOT / "messages" / loc / f"{ns}.json"
        msgs[loc] = json.loads(path.read_text()) if path.exists() else {}

    for item in spec["items"]:
        mode, find, key, sw = item[:4]
        en = item[4] if len(item) > 4 else None
        if find not in src:
            raise SystemExit(f"not found in {spec['file']}: {find!r}")
        inline = False
        if mode == "text":
            # `>Inline text<` keeps its angle brackets
            inline = find.startswith(">") and find.endswith("<")
            body = find[1:-1] if inline else find
            en = en or squash(body)
            lead = re.match(r"\s*", body).group(0)
            trail = re.search(r"\s*$", body).group(0)
            repl = f'{lead}{{{tv}("{key}")}}{trail}'
            if inline:
                repl = f">{repl}<"
        elif mode == "quoted":
            en = en or unquote(find)
            repl = f'{tv}("{key}")'
        elif mode == "attr":
            m = re.match(r'([\w-]+)=(["\'])(.*)\2$', find, re.S)
            if not m:
                raise SystemExit(f"bad attr {find!r}")
            en = en or m.group(3)
            repl = f'{m.group(1)}={{{tv}("{key}")}}'
        else:
            raise SystemExit(f"bad mode {mode}")
        if mode == "text" and not inline:
            # whole-line JSX text only, so short words can't hit other strings
            pattern = re.compile(r"^([ \t]*)" + re.escape(find.strip()) + r"([ \t]*)$", re.M)
            if not pattern.search(src):
                raise SystemExit(f"not a whole line in {spec['file']}: {find!r}")
            src = pattern.sub(lambda m: f'{m.group(1)}{{{tv}("{key}")}}{m.group(2)}', src)
        else:
            src = src.replace(find, repl)
        full =f"{prefix}.{key}" if prefix else key
        set_key(msgs["en"], full, en)
        set_key(msgs["sw"], full, sw)

    if spec.get("hooks"):
        scope = f"{ns}.{prefix}" if prefix else ns
        if not re.search(r"import \{[^}]*useTranslations[^}]*\} from ['\"]next-intl['\"]", src):
            src = src.replace('"use client";\n', '"use client";\n\nimport { useTranslations } from "next-intl";', 1)
        for comp in spec["hooks"]:
            m = re.search(rf"\n(?:export default )?(?:const|function) {comp}\b[^\n]*\{{\n", src)
            if not m:
                raise SystemExit(f"component {comp} not found")
            src = src[: m.end()] + f'  const {tv} = useTranslations("{scope}");\n' + src[m.end():]

    src_path.write_text(src)
    for loc in ("en", "sw"):
        path = ROOT / "messages" / loc / f"{ns}.json"
        path.write_text(json.dumps(msgs[loc], ensure_ascii=False, indent=2) + "\n")
    print(f"{spec['file']}: {len(spec['items'])} strings -> {ns}" + (f".{prefix}" if prefix else ""))


if __name__ == "__main__":
    main(sys.argv[1])
