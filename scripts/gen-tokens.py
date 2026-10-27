#!/usr/bin/env python3
"""
Generate src/styles/tokens.css from the DESIGN.md base colours (ESMM brand, Olsera palette).

Every colour is emitted as space-separated RGB channels ("29 28 26") so Tailwind
opacity modifiers (bg-accent/10, ring-accent/40) keep working with CSS variables.
Tailwind's own palettes (slate, rose, emerald, …) are remapped onto these tokens
in tailwind.config.ts, so existing pages adopt the design system without rewrites.

Run: python3 scripts/gen-tokens.py
"""
from pathlib import Path

def hx(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def mix(a, b, t):
    """t = share of colour a."""
    a, b = hx(a), hx(b)
    return '#%02x%02x%02x' % tuple(round(a[i] * t + b[i] * (1 - t)) for i in range(3))

def ch(h):
    return ' '.join(str(v) for v in hx(h))

WHITE, BLACK = '#ffffff', '#000000'

# ── ESMM brand on the Olsera palette (DESIGN.md › colors / colors-dark) ─────
# v1.3 (2026-10-27, ADR-009): neutral-first chrome. The page is near-neutral
# cool grey; colour is spent on ONE accent (Olsera Blue, the midpoint of the
# logo's wordmark navy #16397B and balloon blue #1393D1) and on meaning
# (status chips). The logo keeps navy + balloon blues.
NEUTRAL = {
    'light': dict(bg='#f7f8fa', side='#f1f3f6', surface='#ffffff', **{'surface-2': '#f4f5f7', 'surface-3': '#eceef1'},
                  sunken='#f1f2f4', border='#e3e6ea', **{'border-strong': '#d0d5dc'}, divider='#edeff2',
                  text='#0d1424', **{'text-2': '#3b4556', 'text-3': '#4f5868', 'text-4': '#7c8594'}),
    'dark': dict(bg='#0a0d14', side='#0c1018', surface='#10141d', **{'surface-2': '#151a25', 'surface-3': '#1c2230'},
                 sunken='#080b11', border='#232a38', **{'border-strong': '#2f3848'}, divider='#1a202b',
                 text='#eef1f6', **{'text-2': '#c3cad6', 'text-3': '#9aa3b2', 'text-4': '#737d8d'}),
}

# Sidebar ("rail"): a quiet neutral panel in both modes, one step off the page.
RAIL = {
    'light': {'rail': '#f1f3f6', 'rail-hover': '#e7eaee', 'rail-active': '#ffffff', 'rail-line': '#e1e5ea',
              'rail-text': '#0d1424', 'rail-text-2': '#3b4556', 'rail-muted': '#5c6574', 'rail-node': '#1468b3'},
    'dark': {'rail': '#0c1018', 'rail-hover': '#151a25', 'rail-active': '#1a2030', 'rail-line': '#1a202b',
             'rail-text': '#eef1f6', 'rail-text-2': '#c3cad6', 'rail-muted': '#8790a0', 'rail-node': '#5aaee9'},
}

# Neutral scale used for slate/gray/zinc/neutral/stone (cool, near-neutral).
NSCALE = {
    'light': {50: '#f4f5f7', 100: '#eceef1', 200: '#e3e6ea', 300: '#d0d5dc', 400: '#7c8594', 500: '#4f5868',
              600: '#3b4556', 700: '#2a3342', 800: '#1a2231', 900: '#0d1424', 950: '#070b15'},
    'dark': {50: '#151a25', 100: '#1c2230', 200: '#232a38', 300: '#2f3848', 400: '#737d8d', 500: '#9aa3b2',
             600: '#c3cad6', 700: '#d8dde6', 800: '#e6e9ef', 900: '#eef1f6', 950: '#f7f8fa'},
}

HUES = {  # (light: darkened for AA text on white, dark: lifted for near-black)
    'red': ('#b42f2a', '#f08a7e'),
    'amber': ('#8a5a0c', '#e8bd5a'),
    'green': ('#1d6b46', '#5fcf96'),
    'blue': ('#1468b3', '#7fbcef'),
    'violet': ('#5f4bb0', '#b3a3f0'),
    'teal': ('#156e72', '#6acdd0'),
    'orange': ('#a4521c', '#eda06a'),
    'rose': ('#ab3a5c', '#f09ab2'),
}

# One brand accent. Light: Olsera Blue (white text 5.7:1). Dark: lifted Olsera Blue (near-black text 7.9:1).
ACCENT_DEFAULT = 'olsera'
ACCENTS = {
    'olsera': ('#1468b3', '#5aaee9'),
}
ON_ACCENT = {'light': '#ffffff', 'dark': '#08101c'}
# Highlight: the logo's balloon blues. Graphics only (logo node, today line), never body text.
HIGHLIGHT = {'light': '#1393d1', 'dark': '#3ac7ea'}

# Charts: accent, amber (warm contrast), slate, balloon blue (+ muted for "before"/target series).
CHARTS = {
    'light': ['#1468b3', '#b7791f', '#6b7484', '#1393d1', '#d0d5dc'],
    'dark': ['#5aaee9', '#e3b062', '#9aa3b2', '#3ac7ea', '#2f3848'],
}

def hue_scale(base, mode):
    surf = NEUTRAL[mode]['surface']
    if mode == 'light':
        return {50: mix(base, surf, .07), 100: mix(base, surf, .12), 200: mix(base, surf, .22),
                300: mix(base, surf, .40), 400: mix(base, surf, .75), 500: mix(base, surf, .90),
                600: base, 700: mix(base, BLACK, .86), 800: mix(base, BLACK, .74), 900: mix(base, BLACK, .62)}
    return {50: mix(base, surf, .10), 100: mix(base, surf, .16), 200: mix(base, surf, .26),
            300: mix(base, surf, .42), 400: base, 500: base, 600: base,
            700: mix(base, WHITE, .82), 800: mix(base, WHITE, .68), 900: mix(base, WHITE, .55)}

def accent_vars(a, mode):
    surf = NEUTRAL[mode]['surface']
    strong = mix(a, BLACK, .85) if mode == 'light' else mix(a, WHITE, .82)
    return {
        'accent': a,
        'accent-strong': strong,
        'accent-soft': mix(a, surf, .10),
        'accent-light': mix(a, surf, .06),
        'accent-line': mix(a, surf, .38),
        'on-accent': ON_ACCENT[mode],
    }

def block(mode):
    out = []
    for k, v in NEUTRAL[mode].items():
        out.append(f'  --c-{k}: {ch(v)};')
    for k, v in NSCALE[mode].items():
        out.append(f'  --c-n-{k}: {ch(v)};')
    for hue, (l, d) in HUES.items():
        for step, v in hue_scale(l if mode == 'light' else d, mode).items():
            out.append(f'  --c-{hue}-{step}: {ch(v)};')
        out.append(f'  --c-{hue}: var(--c-{hue}-600);')
    for k, v in accent_vars(ACCENTS[ACCENT_DEFAULT][0 if mode == 'light' else 1], mode).items():
        out.append(f'  --c-{k}: {ch(v)};')
    for k, v in RAIL[mode].items():
        out.append(f'  --c-{k}: {ch(v)};')
    out.append(f'  --c-highlight: {ch(HIGHLIGHT[mode])};')
    for i, v in enumerate(CHARTS[mode]):
        name = f'chart-{i + 1}' if i < 4 else 'chart-muted'
        out.append(f'  --{name}: rgb({ch(v)});')
    # Plain colour aliases for SVG/Recharts and inline styles.
    for k in ['bg', 'surface', 'border', 'divider', 'text', 'text-2', 'text-3', 'text-4', 'accent', 'accent-soft', 'highlight', 'rail', 'rail-node']:
        out.append(f'  --{k}: rgb(var(--c-{k}));')
    for hue in HUES:
        out.append(f'  --{hue}: rgb(var(--c-{hue}));')
    if mode == 'light':
        out += [
            '  --overlay: rgb(13 20 36 / 0.28);',
            '  --shadow-sm: 0 1px 2px rgb(13 20 36 / 0.06);',
            '  --shadow-card: 0 0 0 1px rgb(13 20 36 / 0.06), 0 1px 2px rgb(13 20 36 / 0.04);',
            '  --shadow-pop: 0 0 0 1px rgb(13 20 36 / 0.06), 0 8px 24px rgb(13 20 36 / 0.12);',
            '  --shadow-drag: 0 0 0 1px rgb(13 20 36 / 0.08), 0 16px 32px rgb(13 20 36 / 0.18);',
            '  color-scheme: light;',
        ]
    else:
        out += [
            '  --overlay: rgb(0 0 0 / 0.55);',
            '  --shadow-sm: 0 0 0 1px rgb(var(--c-border));',
            '  --shadow-card: 0 0 0 1px rgb(var(--c-border));',
            '  --shadow-pop: 0 0 0 1px rgb(var(--c-border-strong)), 0 8px 24px rgb(0 0 0 / 0.4);',
            '  --shadow-drag: 0 0 0 1px rgb(var(--c-border-strong)), 0 16px 32px rgb(0 0 0 / 0.5);',
            '  color-scheme: dark;',
        ]
    return '\n'.join(out)

def accent_block(name, mode):
    a = ACCENTS[name][0 if mode == 'light' else 1]
    return '\n'.join(f'  --c-{k}: {ch(v)};' for k, v in accent_vars(a, mode).items())

DARK_SEL = ":root[data-theme='dark']"
SYS_DARK_SEL = ":root[data-theme='system']"

parts = [
    '/* GENERATED by scripts/gen-tokens.py from DESIGN.md — edit the script, not this file. */',
    '',
    ':root {',
    block('light'),
    '  --font: "Geist Variable", "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;',
    '  --mono: "Geist Mono Variable", "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace;',
    '  --row-h: 40px;',
    '  --gutter: 24px;',
    '  --dur: 140ms;',
    '  --ease: cubic-bezier(0.23, 1, 0.32, 1);',
    '  --spring: cubic-bezier(0.34, 1.56, 0.64, 1);',
    '  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);',
    '}',
    '',
]
for name in ACCENTS:
    if name == ACCENT_DEFAULT:
        continue
    parts += [f":root[data-accent='{name}'] {{", accent_block(name, 'light'), '}']
parts += ['', f'{DARK_SEL} {{', block('dark'), '}']
for name in ACCENTS:
    if name == ACCENT_DEFAULT:
        continue
    parts += [f"{DARK_SEL}[data-accent='{name}'] {{", accent_block(name, 'dark'), '}']
parts += ['', '@media (prefers-color-scheme: dark) {', f'  {SYS_DARK_SEL} {{',
          '\n'.join('  ' + l for l in block('dark').splitlines()), '  }']
for name in ACCENTS:
    if name == ACCENT_DEFAULT:
        continue
    parts += [f"  {SYS_DARK_SEL}[data-accent='{name}'] {{",
              '\n'.join('  ' + l for l in accent_block(name, 'dark').splitlines()), '  }']
parts += ['}', '', "[data-density='compact'] { --row-h: 34px; }", '', '@media (max-width: 900px) {', '  :root { --gutter: 16px; }', '}', '']

out = Path(__file__).resolve().parent.parent / 'src' / 'styles' / 'tokens.css'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text('\n'.join(parts))
print(f'wrote {out} ({len(parts)} blocks)')
