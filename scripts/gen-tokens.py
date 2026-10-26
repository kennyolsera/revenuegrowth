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
# Colours sampled from the Olsera logo (2026-10-26): wordmark Navy #16397B,
# balloon Ocean #1393D1, Sky #10AAE2, Cyan #3AC7EA.
# Light = cool Cloud ground, white panels, Navy Ink text. Dark = Night Navy ground.
NEUTRAL = {
    'light': dict(bg='#f4f7fb', side='#16397b', surface='#ffffff', **{'surface-2': '#f6f8fc', 'surface-3': '#ebf0f7'},
                  sunken='#eef2f8', border='#dfe6f0', **{'border-strong': '#cad4e3'}, divider='#e8edf5',
                  text='#0f1e3d', **{'text-2': '#3a4a66', 'text-3': '#4b5a75', 'text-4': '#77849b'}),
    'dark': dict(bg='#0b1b3a', side='#0d2350', surface='#102449', **{'surface-2': '#142b54', 'surface-3': '#1a335f'},
                 sunken='#091733', border='#213c69', **{'border-strong': '#2c4a7c'}, divider='#18305a',
                 text='#f4f7fb', **{'text-2': '#c9d5e8', 'text-3': '#a7b6cf', 'text-4': '#7e8eaa'}),
}

# The sidebar ("rail") is Olsera Navy in BOTH modes; the node is Balloon Cyan.
RAIL = {
    'light': {'rail': '#16397b', 'rail-hover': '#1d4588', 'rail-active': '#255297', 'rail-line': '#24488a',
              'rail-text': '#ffffff', 'rail-text-2': '#d3def0', 'rail-muted': '#9db2d6', 'rail-node': '#3ac7ea'},
    'dark': {'rail': '#0d2350', 'rail-hover': '#163066', 'rail-active': '#1e3b78', 'rail-line': '#1a3466',
             'rail-text': '#ffffff', 'rail-text-2': '#d3def0', 'rail-muted': '#9db2d6', 'rail-node': '#3ac7ea'},
}

# Neutral scale used for slate/gray/zinc/neutral/stone (cool navy-grey).
NSCALE = {
    'light': {50: '#f6f8fc', 100: '#ebf0f7', 200: '#dfe6f0', 300: '#cad4e3', 400: '#77849b', 500: '#4b5a75',
              600: '#3a4a66', 700: '#283754', 800: '#1a2846', 900: '#0f1e3d', 950: '#091530'},
    'dark': {50: '#142b54', 100: '#1a335f', 200: '#213c69', 300: '#2c4a7c', 400: '#7e8eaa', 500: '#a7b6cf',
             600: '#c9d5e8', 700: '#dce4f1', 800: '#e9eef7', 900: '#f4f7fb', 950: '#fafcfe'},
}

HUES = {  # (light: darkened for AA text on cloud/white, dark: lifted for night navy)
    'red': ('#b23c30', '#f08a7e'),
    'amber': ('#8a5a0c', '#e8bd5a'),
    'green': ('#1f6e45', '#5fd39a'),
    'blue': ('#1c6aa8', '#8fc4f0'),
    'violet': ('#6b51a8', '#b8a2ee'),
    'teal': ('#1d6f72', '#6fcfd2'),
    'orange': ('#a65a26', '#e8a06c'),
    'rose': ('#b0405f', '#f09ab2'),
}

# One brand accent. Light: Olsera Navy (white text 11:1). Dark: Balloon Cyan (navy text 8.5:1).
ACCENT_DEFAULT = 'olsera'
ACCENTS = {
    'olsera': ('#16397b', '#3ac7ea'),
}
ON_ACCENT = {'light': '#ffffff', 'dark': '#0b1b3a'}
# Highlight (was Copper): Balloon Ocean / Sky. Graphics and marks only, never body text.
HIGHLIGHT = {'light': '#1393d1', 'dark': '#10aae2'}

# Charts: Navy, Ocean, Amber (warm contrast), Slate Blue (+ muted for "before"/target series).
CHARTS = {
    'light': ['#16397b', '#1393d1', '#c8862a', '#6b7fa3', '#cad4e3'],
    'dark': ['#3ac7ea', '#8fb4f0', '#e8b05a', '#a7b6cf', '#2c4a7c'],
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
            '  --overlay: rgb(15 30 61 / 0.28);',
            '  --shadow-sm: 0 1px 2px rgb(15 30 61 / 0.06);',
            '  --shadow-card: 0 0 0 1px rgb(15 30 61 / 0.06), 0 1px 2px rgb(15 30 61 / 0.04);',
            '  --shadow-pop: 0 0 0 1px rgb(15 30 61 / 0.06), 0 8px 24px rgb(15 30 61 / 0.12);',
            '  --shadow-drag: 0 0 0 1px rgb(15 30 61 / 0.08), 0 16px 32px rgb(15 30 61 / 0.18);',
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
    '  --font: "Sora Variable", "Sora", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;',
    '  --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;',
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
