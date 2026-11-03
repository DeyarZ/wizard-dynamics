#!/usr/bin/env python3
"""Refresh the Grass Identifier revenue chart in the hero card from RevenueCat.

    python3 tools/update-charts.py            # rewrite the chart SVG in index.html
    python3 tools/update-charts.py --dry-run  # only print the monthly values

Reads RC_API_KEY (Grass) from ~/.claude/.env.secrets (never stored in the repo).
RevenueCat reports revenue in USD, before Apple's fee; the chart stays in USD (App Store currency).
The chart shows monthly revenue from launch through THROUGH (the end of the summer season).
After running: check the hero card title/note and the Grass case number still match, then commit.
"""
import datetime
import json
import os
import re
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")

PROJECT, KEY_ENV = "proj98d6cf78", "RC_API_KEY"
START, THROUGH = "2025-07", "2026-08"   # launch month .. last month shown
GRID = [(5000, "$5k"), (10000, "$10k"), (15000, "$15k"), (20000, "$20k")]
YMAX = 21500

# Geometry (viewBox 700 x 370, dark card). Bars run left to right; gridlines start at GRID_X0 so the
# card title in the top-left never sits on a line; grid labels sit right of the last bar.
W, H = 700, 370
X0, X1 = 0, 640          # bar area
Y_TOP, Y_BOTTOM = 22, 326
GRID_X0 = 380
BAR_GAP = 0.34           # share of each slot left empty


def secrets():
    env = {}
    with open(os.path.expanduser("~/.claude/.env.secrets")) as f:
        for line in f:
            m = re.match(r"\s*(?:export\s+)?([A-Z0-9_]+)=(.*)", line)
            if m:
                env[m.group(1)] = m.group(2).strip().strip('"').strip("'")
    return env


def monthly_revenue(key):
    q = urllib.parse.urlencode({"resolution": "month", "start_date": START + "-01",
                                "end_date": datetime.date.today().isoformat()})
    req = urllib.request.Request(
        f"https://api.revenuecat.com/v2/projects/{PROJECT}/charts/revenue?{q}",
        headers={"Authorization": f"Bearer {key}"},
    )
    data = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
    rows = []
    for v in data["values"]:
        if v.get("measure", 0) != 0:      # measure 0 = revenue, 1 = transactions
            continue
        month = datetime.datetime.fromtimestamp(v["cohort"], datetime.timezone.utc).strftime("%Y-%m")
        if START <= month <= THROUGH and not v.get("incomplete"):
            rows.append((month, v["value"]))
    return sorted(rows)


def svg(rows):
    n = len(rows)
    slot = (X1 - X0) / n
    bw = slot * (1 - BAR_GAP)
    y = lambda v: Y_BOTTOM - (Y_BOTTOM - Y_TOP) * (v / YMAX)
    best = max(rows, key=lambda r: r[1])
    parts = []
    for v, label in GRID:
        parts.append(f'<line x1="{GRID_X0}" x2="{W}" y1="{y(v):.1f}" y2="{y(v):.1f}" stroke="rgba(255,255,255,.13)" stroke-width="1"/>'
                     f'<text x="{W}" y="{y(v) - 7:.1f}" fill="#85858f" font-size="12" text-anchor="end">{label}</text>')
    parts.append(f'<line x1="0" x2="{W}" y1="{Y_BOTTOM}" y2="{Y_BOTTOM}" stroke="rgba(255,255,255,.13)" stroke-width="1"/>')
    for i, (month, v) in enumerate(rows):
        x = X0 + i * slot + (slot - bw) / 2
        top = y(v)
        h = max(Y_BOTTOM - top, 2)
        r = min(4, bw / 2, h / 2)
        # rounded top corners only
        parts.append(
            f'<path d="M{x:.1f},{Y_BOTTOM} V{top + r:.1f} Q{x:.1f},{top:.1f} {x + r:.1f},{top:.1f} '
            f'H{x + bw - r:.1f} Q{x + bw:.1f},{top:.1f} {x + bw:.1f},{top + r:.1f} V{Y_BOTTOM} Z" fill="#ffffff"/>'
        )
        if (month, v) == best:
            parts.append(f'<text class="chart-end" x="{x + bw / 2:.1f}" y="{top - 10:.1f}" fill="#ffffff" font-size="16" '
                         f'font-weight="650" text-anchor="middle">${v / 1000:.1f}k</text>')
    fmt = lambda m: datetime.date(int(m[:4]), int(m[5:]), 1).strftime("%b %Y")
    first_x = X0 + (slot - bw) / 2
    last_x = X0 + (n - 1) * slot + (slot + bw) / 2
    parts.append(f'<text x="{first_x:.1f}" y="{H - 12}" fill="#85858f" font-size="12">{fmt(rows[0][0])}</text>')
    parts.append(f'<text x="{last_x:.1f}" y="{H - 12}" fill="#85858f" font-size="12" text-anchor="end">{fmt(rows[-1][0])}</text>')
    title = (f"Grass Identifier monthly revenue from {fmt(rows[0][0])} to {fmt(rows[-1][0])}, "
             f"best month {fmt(best[0])} at ${best[1] / 1000:.1f}k")
    return (f'<svg class="chart" viewBox="0 0 {W} {H}" role="img" aria-labelledby="grass-t">'
            f'<title id="grass-t">{title}</title>{"".join(parts)}</svg>')


def main():
    dry = "--dry-run" in sys.argv
    rows = monthly_revenue(secrets()[KEY_ENV])
    for month, v in rows:
        print(f"{month}  ${v:>9,.0f}")
    summer = [v for m, v in rows if m >= "2026-05"]
    if summer:
        print(f"May..{THROUGH} average: ${sum(summer) / len(summer):,.0f}")
    if max(v for _, v in rows) > YMAX:
        print("  ! a month is above YMAX; raise YMAX")
    html = open(INDEX).read()
    pattern = re.compile(r'<svg class="chart"[^>]*aria-labelledby="grass-t">.*?</svg>', re.S)
    if not pattern.search(html):
        sys.exit("grass chart not found in index.html")
    html = pattern.sub(lambda _: svg(rows), html, count=1)
    if dry:
        print("dry run, index.html unchanged")
    else:
        open(INDEX, "w").write(html)
        print("index.html updated")


if __name__ == "__main__":
    main()
