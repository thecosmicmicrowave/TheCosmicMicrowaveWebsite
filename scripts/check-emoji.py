"""Fail if any built HTML page contains an emoji or pictographic symbol.

Byte-range greps do not work for this: GNU grep treats \\xNN inside a bracket
expression as literal characters, so such a pattern silently reports clean.
"""
import glob
import sys
import unicodedata

RANGES = (
    (0x1F000, 0x1FAFF),  # pictographs, emoticons, transport, symbols
    (0x2600,  0x27BF),   # misc symbols and dingbats
    (0x2B00,  0x2BFF),   # arrows and stars
    (0xFE0F,  0xFE0F),   # variation selector-16
)


def is_emoji(ch: str) -> bool:
    cp = ord(ch)
    if any(lo <= cp <= hi for lo, hi in RANGES):
        return True
    return cp > 0x2500 and unicodedata.category(ch) == "So"


def main() -> int:
    hits = []
    for path in sorted(glob.glob("public/**/*.html", recursive=True)):
        with open(path, encoding="utf-8") as fh:
            for lineno, line in enumerate(fh, 1):
                for ch in line:
                    if is_emoji(ch):
                        name = unicodedata.name(ch, "unnamed")
                        hits.append(f"{path}:{lineno}: U+{ord(ch):04X} {name}")
    if hits:
        print("\n".join(hits))
        print(f"\nFAIL: {len(hits)} emoji found")
        return 1
    print("CLEAN: no emoji in built output")
    return 0


if __name__ == "__main__":
    sys.exit(main())
