#!/usr/bin/env python3
"""Subset Schibsted Grotesk Variable for the site: python3 scripts/fonts.py

Keeps the font small so text renders fast on phones. We keep:
- axis wght 400–900,
- Basic Latin + Latin-1 + common punctuation in the `latin` file, Czech/Slovak/Polish/German
  extras in the `latin-ext` file (same split and unicode-range as fontsource, so the browser
  fetches latin-ext only when a page actually contains such a letter — i.e. always on Czech pages),
- OpenType features the design uses (tnum for times/scores, kern, liga).
Output: src/assets/fonts/schibsted-grotesk-{latin,latin-ext}.woff2 (hashed by Vite at build).
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

SRC = Path('node_modules/@fontsource-variable/schibsted-grotesk/files')
OUT = Path('src/assets/fonts')
LATIN = [*range(0x20, 0x7F), *range(0xA0, 0x100), *range(0x2010, 0x2028), *range(0x2030, 0x203B), 0x20AC, 0x2122, 0x2212]
EXT = [ord(c) for c in 'ĀāĂăĄąĆćČčĎďĐđĒēĘęĚěĹĺĽľŁłŃńŇňŐőŔŕŘřŚśŞşŠšŢţŤťŮůŰűŹźŻżŽž']

OUT.mkdir(parents=True, exist_ok=True)
for name, codes in [('latin', LATIN), ('latin-ext', EXT)]:
    font = TTFont(SRC / f'schibsted-grotesk-{name}-wght-normal.woff2')
    font = instancer.instantiateVariableFont(font, {'wght': (400, 900)})
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['kern', 'liga', 'calt', 'tnum', 'lnum', 'ccmp', 'mark', 'mkmk']
    opts.hinting = False
    opts.name_IDs = [1, 2, 3, 4, 6]
    s = subset.Subsetter(opts)
    s.populate(unicodes=codes)
    s.subset(font)
    font.flavor = 'woff2'
    out = OUT / f'schibsted-grotesk-{name}.woff2'
    font.save(out)
    print(out, out.stat().st_size, 'B')
