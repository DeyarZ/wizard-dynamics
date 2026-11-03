#!/usr/bin/env python3
"""Refresh the two revenue charts on the landing page from RevenueCat.

    python3 tools/update-charts.py            # rewrite both chart SVGs in index.html
    python3 tools/update-charts.py --dry-run  # only print the latest values

Reads RC_API_KEY (Grass) and RC_API_KEY_ROCK from ~/.claude/.env.secrets (never stored in the repo).
RevenueCat charts are in USD; we convert with one rate so the curve's shape stays exact.
After running: check the end labels and the case numbers on the page still match, then commit.
"""
import datetime
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX = os.path.join(ROOT, "index.html")
USD_TO_EUR = 0.87  # keep in line with the EUR MRR in Studios/os/snapshot.md

CHARTS = {
    # Hero poster: wide, dark. Gridlines start at x=360 so the title can sit in the empty top-left.
    "grass": dict(project="proj98d6cf78", env="RC_API_KEY", ymax=8000, end_label="€7.5k",
                  grid=[(2500, "€2.5k"), (5000, "€5k")], theme="dark",
                  w=700, h=370, x1=612, y_top=24, y_bottom=326, grid_x0=360, grid_label="end"),
    # Rock case panel: light.
    "rock": dict(project="proj679ef609", env="RC_API_KEY_ROCK", ymax=2500, end_label="€2.3k",
                 grid=[(1000, "€1k"), (2000, "€2k")], theme="light",
                 w=480, h=300, x1=404, y_top=22, y_bottom=262, grid_x0=0, grid_label="start"),
}
THEMES = {
    "dark": dict(line="#ffffff", rule="rgba(255,255,255,.13)", label="#85858f", end="#ffffff", ring="#09080d"),
    "light": dict(line="#0a0a0f", rule="rgba(10,10,15,.12)", label="#6b6b77", end="#0a0a0f", ring="#ffffff"),
}


def secrets():
    env = {}
    with open(os.path.expanduser("~/.claude/.env.secrets")) as f:
        for line in f:
            m = re.match(r"\s*(?:export\s+)?([A-Z0-9_]+)=(.*)", line)
            if m:
                env[m.group(1)] = m.group(2).strip().strip('"').strip("'")
    return env


def mrr(project, key):
    req = urllib.request.Request(
        f"https://api.revenuecat.com/v2/projects/{project}/charts/mrr",
        headers={"Authorization": f"Bearer {key}"},
    )
    data = json.loads(urllib.request.urlopen(req, timeout=30).read().decode())
    pts = [
        (datetime.datetime.fromtimestamp(v["cohort"], datetime.timezone.utc).date(), v["value"] * USD_TO_EUR)
        for v in data["values"]
        if not v.get("incomplete")
    ]
    # centred 7-day moving average to remove pixel noise; the endpoint stays the true last value
    smooth = []
    for i, (day, _) in enumerate(pts):
        window = [v for _, v in pts[max(0, i - 3):i + 4]]
        smooth.append((day, sum(window) / len(window)))
    smooth[-1] = pts[-1]
    return smooth


def svg(ident, pts, c):
    t = THEMES[c["theme"]]
    t0, t1 = pts[0][0], pts[-1][0]
    span = (t1 - t0).days
    x = lambda d: c["x1"] * ((d - t0).days / span)
    y = lambda v: c["y_bottom"] - (c["y_bottom"] - c["y_top"]) * (v / c["ymax"])
    sample = pts[::3]
    if sample[-1] != pts[-1]:
        sample.append(pts[-1])
    d = "M" + " L".join(f"{x(day):.1f},{y(v):.1f}" for day, v in sample)
    ex, ey = x(t1), y(pts[-1][1])
    m0, m1 = t0.strftime("%b %Y"), t1.strftime("%b %Y")
    grid = "".join(
        f'<line x1="{c["grid_x0"]}" x2="{c["x1"]}" y1="{y(v):.1f}" y2="{y(v):.1f}" stroke="{t["rule"]}" stroke-width="1"/>'
        + (f'<text x="{c["x1"]}" y="{y(v) - 7:.1f}" fill="{t["label"]}" font-size="12" text-anchor="end">{label}</text>'
           if c["grid_label"] == "end" else
           f'<text x="{c["grid_x0"]}" y="{y(v) - 7:.1f}" fill="{t["label"]}" font-size="12">{label}</text>')
        for v, label in c["grid"]
    )
    return (
        f'<svg class="chart" viewBox="0 0 {c["w"]} {c["h"]}" role="img" aria-labelledby="{ident}-t">'
        f'<title id="{ident}-t">Monthly recurring revenue from {m0} to {m1}, ending at {c["end_label"]}</title>'
        f'{grid}<line x1="0" x2="{c["x1"]}" y1="{c["y_bottom"]}" y2="{c["y_bottom"]}" stroke="{t["rule"]}" stroke-width="1"/>'
        f'<path d="{d}" fill="none" stroke="{t["line"]}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>'
        f'<circle cx="{ex:.1f}" cy="{ey:.1f}" r="6.5" fill="#1e54f0" stroke="{t["ring"]}" stroke-width="3"/>'
        f'<text class="chart-end" x="{ex + 14:.1f}" y="{ey + 5:.1f}" fill="{t["end"]}" font-size="16" font-weight="650">{c["end_label"]}</text>'
        f'<text x="0" y="{c["h"] - 12}" fill="{t["label"]}" font-size="12">{m0}</text>'
        f'<text x="{c["x1"]}" y="{c["h"] - 12}" fill="{t["label"]}" font-size="12" text-anchor="end">{m1}</text>'
        "</svg>"
    )


def main():
    dry = "--dry-run" in sys.argv
    env = secrets()
    html = open(INDEX).read()
    for ident, c in CHARTS.items():
        pts = mrr(c["project"], env[c["env"]])
        print(f"{ident}: {pts[0][0]} to {pts[-1][0]}, latest MRR €{pts[-1][1]:,.0f} (label says {c['end_label']})")
        if pts[-1][1] > c["ymax"]:
            print(f"  ! latest value is above the y-axis max ({c['ymax']}); raise ymax and the gridlines")
        pattern = re.compile(r'<svg class="chart"[^>]*aria-labelledby="' + ident + r'-t">.*?</svg>', re.S)
        if not pattern.search(html):
            sys.exit(f"chart '{ident}' not found in index.html")
        html = pattern.sub(lambda _: svg(ident, pts, c), html, count=1)
    if dry:
        print("dry run, index.html unchanged")
    else:
        open(INDEX, "w").write(html)
        print("index.html updated")


if __name__ == "__main__":
    main()
