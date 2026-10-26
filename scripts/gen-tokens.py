#!/usr/bin/env python3
"""
Generate src/styles/tokens.css from the DESIGN.md base colours.

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

# ── DESIGN.md › colors / colors-dark ─────────────────────────────────────────
NEUTRAL = {
    'light': dict(bg='#fbfaf8', side='#f4f3f0', surface='#ffffff', **{'surface-2': '#f6f5f2', 'surface-3': '#eeede9'},
                  sunken='#f7f6f3', border='#e9e7e2', **{'border-strong': '#dad7d0'}, divider='#f0eeea',
                  text='#1d1c1a', **{'text-2': '#57544e', 'text-3': '#6b6760', 'text-4': '#8c8880'}),
    'dark': dict(bg='#1a1a19', side='#151514', surface='#1d1d1c', **{'surface-2': '#252524', 'surface-3': '#2d2d2b'},
                 sunken='#181817', border='#2c2b29', **{'border-strong': '#3a3936'}, divider='#252523',
                 text='#eceae5', **{'text-2': '#b5b2ab', 'text-3': '#9a968f', 'text-4': '#6f6c66'}),
}

# Neutral scale used for slate/gray/zinc/neutral/stone.
NSCALE = {
    'light': {50: '#f6f5f2', 100: '#eeede9', 200: '#e9e7e2', 300: '#dad7d0', 400: '#8c8880', 500: '#6b6760',
              600: '#57544e', 700: '#3f3d39', 800: '#2a2927', 900: '#1d1c1a', 950: '#141412'},
    'dark': {50: '#252524', 100: '#2d2d2b', 200: '#2c2b29', 300: '#3a3936', 400: '#6f6c66', 500: '#9a968f',
             600: '#b5b2ab', 700: '#cfccc5', 800: '#e0ded8', 900: '#eceae5', 950: '#f5f4f0'},
}

HUES = {  # (light: darkened for AA text, dark: lifted)
    'red': ('#b23c30', '#ec7a6e'),
    'amber': ('#8f5e0e', '#e0b54a'),
    'green': ('#25754b', '#5cc08e'),
    'blue': ('#2f6fd6', '#7ea2f0'),
    'violet': ('#7652c2', '#a98bf5'),
    'teal': ('#1f7f86', '#5cc3c9'),
    'orange': ('#b4561a', '#f0a067'),
    'rose': ('#c2416b', '#ee8aab'),
}

ACCENTS = {  # name: (light, dark)
    'indigo': ('#4b5bd6', '#8e9af3'),
    'blue': ('#2f6fd6', '#7ea2f0'),
    'violet': ('#7652c2', '#a98bf5'),
    'teal': ('#1f7f86', '#5cc3c9'),
    'rose': ('#c2416b', '#ee8aab'),
    'graphite': ('#3f3d39', '#c9c5bd'),
}

CHARTS = {
    'light': ['#2e5aac', '#1e8e5a', '#b8860b', '#7c3aed', '#c9c5bd'],
    'dark': ['#7ea2f0', '#5cc08e', '#e0b54a', '#a98bf5', '#4a4844'],
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
        'on-accent': '#ffffff' if mode == 'light' else '#14142a',
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
    for k, v in accent_vars(ACCENTS['indigo'][0 if mode == 'light' else 1], mode).items():
        out.append(f'  --c-{k}: {ch(v)};')
    for i, v in enumerate(CHARTS[mode]):
        name = f'chart-{i + 1}' if i < 4 else 'chart-muted'
        out.append(f'  --{name}: rgb({ch(v)});')
    # Plain colour aliases for SVG/Recharts and inline styles.
    for k in ['bg', 'surface', 'border', 'divider', 'text', 'text-2', 'text-3', 'text-4', 'accent', 'accent-soft']:
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
    '  --font: var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;',
    '  --mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace;',
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
    if name == 'indigo':
        continue
    parts += [f":root[data-accent='{name}'] {{", accent_block(name, 'light'), '}']
parts += ['', f'{DARK_SEL} {{', block('dark'), '}']
for name in ACCENTS:
    if name == 'indigo':
        continue
    parts += [f"{DARK_SEL}[data-accent='{name}'] {{", accent_block(name, 'dark'), '}']
parts += ['', '@media (prefers-color-scheme: dark) {', f'  {SYS_DARK_SEL} {{',
          '\n'.join('  ' + l for l in block('dark').splitlines()), '  }']
for name in ACCENTS:
    if name == 'indigo':
        continue
    parts += [f"  {SYS_DARK_SEL}[data-accent='{name}'] {{",
              '\n'.join('  ' + l for l in accent_block(name, 'dark').splitlines()), '  }']
parts += ['}', '', "[data-density='compact'] { --row-h: 34px; }", '', '@media (max-width: 900px) {', '  :root { --gutter: 16px; }', '}', '']

out = Path(__file__).resolve().parent.parent / 'src' / 'styles' / 'tokens.css'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text('\n'.join(parts))
print(f'wrote {out} ({len(parts)} blocks)')
