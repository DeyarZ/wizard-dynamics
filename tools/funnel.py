#!/usr/bin/env python3
"""What visitors did, per ad, from our own counters (api/stats.js).

  python3 tools/funnel.py            last 7 days, all ads together and each ad
  python3 tools/funnel.py 30         last 30 days
  python3 tools/funnel.py 7 ad-name  one ad (the utm_content, or utm_source, or "direct")

Percentages are of the visits to that page. Cost per lead per ad is in Meta Ads Manager (the Lead event from api/_meta.js).
Needs WD_STATS_KEY in the environment or in ~/.claude/.env.secrets.
"""
import json
import os
import re
import sys
import urllib.request

SITE = "https://www.wizarddynamics.com"
TIME = ["t_10s", "t_30s", "t_1m", "t_2m", "t_3m", "t_5m", "t_10m"]
SECTIONS = ["top", "proof", "work", "services", "process", "offer", "founders", "faq", "book"]
VIDEO = ["v_10s", "v_30s", "v_1m", "v_2m", "v_3m", "v_4m", "v_5m", "v_end"]
QUIZ = ["est_stage", "est_blocker", "est_features", "est_timeline", "est_budget", "est_contact", "est_thanks", "est_pick_time", "est_booked"]
POPUP = ["popup_idle", "popup_idle_sent", "popup_video", "popup_video_sent", "popup_video_end", "popup_video_end_sent", "popup_pick_time", "popup_booked"]
LEADS = ["lead_estimate", "lead_call", "lead_audit", "booked"]


def key():
    if os.environ.get("WD_STATS_KEY"):
        return os.environ["WD_STATS_KEY"]
    path = os.path.expanduser("~/.claude/.env.secrets")
    for line in open(path, encoding="utf-8"):
        m = re.match(r"^(?:export )?WD_STATS_KEY=[\"']?([^\"'\n]+)", line)
        if m:
            return m.group(1)
    sys.exit("WD_STATS_KEY not found")


def fetch(days):
    req = urllib.request.Request(f"{SITE}/api/stats?days={days}", headers={"Authorization": "Bearer " + key(), "User-Agent": "wd-funnel"})
    return json.load(urllib.request.urlopen(req, timeout=20))


def rows(c, names, base, label=None):
    for n in names:
        v = c.get(n, 0)
        if not v:
            continue
        pct = f"{v / base * 100:4.0f} %" if base else "     "
        print(f"  {(label(n) if label else n):<22}{v:>6}  {pct}")


def report(title, c):
    home, est = c.get("home_view", 0), c.get("est_view", 0)
    print(f"\n{title}\n  landing page {home}, estimate page {est}, first quiz answer {c.get('quiz_start', 0)}, leads {sum(c.get(k, 0) for k in LEADS[:3])}, bookings {c.get('booked', 0)}")
    if home:
        print(" stayed on the landing page at least")
        rows(c, TIME, home, lambda n: n[2:])
        print(" sections reached, average seconds there")
        for s in SECTIONS:
            seen, sec = c.get("sec_" + s, 0), c.get("s_" + s, 0)
            if seen:
                print(f"  {s:<22}{seen:>6}  {seen / home * 100:4.0f} %   {sec / seen:5.0f} s")
    if c.get("video_play"):
        print(f" video: {c['video_play']} pressed play ({c['video_play'] / home * 100 if home else 0:.0f} % of landing visits), of those at least")
        rows(c, VIDEO, c["video_play"], lambda n: n[2:])
    if est:
        print(" quiz")
        rows(c, QUIZ, est, lambda n: n[4:])
        slow = sorted(((c.get("s_est_" + n[4:], 0) / c[n], n[4:]) for n in QUIZ if c.get(n)), reverse=True)[:2]
        if slow:
            print("  slowest: " + ", ".join(f"{n} {s:.0f} s" for s, n in slow))
    if any(c.get(n) for n in POPUP):
        print(" short form")
        rows(c, POPUP, home, lambda n: n[6:])


def main():
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 7
    only = sys.argv[2] if len(sys.argv) > 2 else None
    d = fetch(days)
    print(f"{d['from']} to {d['to']}")
    if only:
        report(only, d["ads"].get(only, {}))
        return
    report("ALL", d["total"])
    for ad, c in sorted(d["ads"].items(), key=lambda kv: -kv[1].get("home_view", 0) - kv[1].get("est_view", 0)):
        report(ad, c)


if __name__ == "__main__":
    main()
