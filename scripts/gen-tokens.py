#!/usr/bin/env python3
"""
Generate src/styles/tokens.css from the DESIGN.md base colours (ESMM brand).

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

# ── ESMM brand (DESIGN.md › colors / colors-dark) ───────────────────────────
# Light = warm Paper ground, white panels, Ink text. Dark = Forest Ink ground, Canopy-tinted panels.
NEUTRAL = {
    'light': dict(bg='#f3f1ea', side='#0d2620', surface='#ffffff', **{'surface-2': '#f5f3ee', 'surface-3': '#ece9e1'},
                  sunken='#efece4', border='#e2ded4', **{'border-strong': '#d3cec1'}, divider='#ece8df',
                  text='#10201b', **{'text-2': '#3e4e48', 'text-3': '#4f5e58', 'text-4': '#7a8781'}),
    'dark': dict(bg='#0d2620', side='#0a1f1a', surface='#133229', **{'surface-2': '#18392f', 'surface-3': '#1f4237'},
                 sunken='#0b211b', border='#24463b', **{'border-strong': '#2f5547'}, divider='#1a3a30',
                 text='#f3f1ea', **{'text-2': '#c9d4cf', 'text-3': '#a9b8b1', 'text-4': '#7e8f88'}),
}

# The sidebar ("rail") is Forest in BOTH modes (Kenny, 2026-10-26: option A).
RAIL = {
    'light': {'rail': '#0d2620', 'rail-hover': '#173a30', 'rail-active': '#1f4a3d', 'rail-line': '#1f3d34',
              'rail-text': '#f3f1ea', 'rail-text-2': '#c9d4cf', 'rail-muted': '#8fa39b', 'rail-node': '#3ddc97'},
    'dark': {'rail': '#0a1f1a', 'rail-hover': '#143429', 'rail-active': '#1c4436', 'rail-line': '#183a30',
             'rail-text': '#f3f1ea', 'rail-text-2': '#c9d4cf', 'rail-muted': '#8fa39b', 'rail-node': '#3ddc97'},
}

# Neutral scale used for slate/gray/zinc/neutral/stone (green-grey, warm).
NSCALE = {
    'light': {50: '#f5f3ee', 100: '#ece9e1', 200: '#e2ded4', 300: '#d3cec1', 400: '#7a8781', 500: '#4f5e58',
              600: '#3e4e48', 700: '#2c3a35', 800: '#1c2a25', 900: '#10201b', 950: '#0a1612'},
    'dark': {50: '#18392f', 100: '#1f4237', 200: '#24463b', 300: '#2f5547', 400: '#7e8f88', 500: '#a9b8b1',
             600: '#c9d4cf', 700: '#dde4e0', 800: '#e9ede9', 900: '#f3f1ea', 950: '#faf9f5'},
}

HUES = {  # (light: darkened for AA text on paper/white, dark: lifted for forest)
    'red': ('#b23c30', '#f08a7e'),
    'amber': ('#8a5a0c', '#e8bd5a'),
    'green': ('#1f6e45', '#5fd39a'),
    'blue': ('#33669e', '#8fb4e0'),
    'violet': ('#6b51a8', '#b8a2ee'),
    'teal': ('#1d6f72', '#6fcfd2'),
    'orange': ('#a65a26', '#e8a06c'),
    'rose': ('#b0405f', '#f09ab2'),
}

# One brand accent. Light: Deep Mint (paper text 5.2:1). Dark: Signal Mint (forest text 9:1).
ACCENT_DEFAULT = 'esmm'
ACCENTS = {
    'esmm': ('#0b7350', '#3ddc97'),
}
ON_ACCENT = {'light': '#f3f1ea', 'dark': '#0d2620'}
COPPER = {'light': '#c8743c', 'dark': '#e0965f'}

# Charts: Deep Mint, Copper, Slate Blue, Sand (+ muted for "before"/target series).
CHARTS = {
    'light': ['#0b7350', '#c8743c', '#3b6ea8', '#a88b3d', '#cfc9bb'],
    'dark': ['#3ddc97', '#e0965f', '#8fb4e0', '#d4bc7a', '#3a5a4f'],
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
    out.append(f'  --c-copper: {ch(COPPER[mode])};')
    for i, v in enumerate(CHARTS[mode]):
        name = f'chart-{i + 1}' if i < 4 else 'chart-muted'
        out.append(f'  --{name}: rgb({ch(v)});')
    # Plain colour aliases for SVG/Recharts and inline styles.
    for k in ['bg', 'surface', 'border', 'divider', 'text', 'text-2', 'text-3', 'text-4', 'accent', 'accent-soft', 'copper', 'rail', 'rail-node']:
        out.append(f'  --{k}: rgb(var(--c-{k}));')
    for hue in HUES:
        out.append(f'  --{hue}: rgb(var(--c-{hue}));')
    if mode == 'light':
        out += [
            '  --overlay: rgb(29 28 26 / 0.28);',
            '  --shadow-sm: 0 1px 2px rgb(29 28 26 / 0.06);',
            '  --shadow-card: 0 0 0 1px rgb(29 28 26 / 0.06), 0 1px 2px rgb(29 28 26 / 0.04);',
            '  --shadow-pop: 0 0 0 1px rgb(29 28 26 / 0.06), 0 8px 24px rgb(29 28 26 / 0.12);',
            '  --shadow-drag: 0 0 0 1px rgb(29 28 26 / 0.08), 0 16px 32px rgb(29 28 26 / 0.18);',
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
