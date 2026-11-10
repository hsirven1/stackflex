#!/usr/bin/env python3
"""Download confirmed direct logo asset links listed in logo-sources.json.
Review downloaded images before integrating into StackFlex.
Usage: python3 download_logo_assets.py
"""
import json
import shutil
import urllib.parse
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent
OUT = BASE / "downloads"
OUT.mkdir(exist_ok=True)
catalog = json.loads((BASE / "logo-sources.json").read_text(encoding="utf-8"))
results = []
for asset in catalog:
    url = asset["direct"]
    if not url:
        results.append((asset["tool"],"manual source review needed",asset["source"]))
        continue
    extension = ".zip" if url.split("?")[0].lower().endswith(".zip") else (
        ".svg" if url.split("?")[0].lower().endswith(".svg") else ".png")
    dest = OUT / (asset["slug"] + extension)
    try:
        request = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0 StackFlex-logo-source-review"})
        with urllib.request.urlopen(request, timeout=25) as response, dest.open("wb") as output:
            shutil.copyfileobj(response, output)
        data = dest.read_bytes()
        if len(data) < 20 or (extension == ".svg" and b"<svg" not in data[:1000]):
            raise ValueError("Unexpected or invalid download")
        results.append((asset["tool"],f"saved {dest.name} ({len(data)} bytes)","verify visual and usage rights"))
    except Exception as exc:
        dest.unlink(missing_ok=True)
        results.append((asset["tool"],f"download failed: {type(exc).__name__}",asset["source"]))
for name, status, detail in results:
    print(f"{name:18} {status:42} {detail}")
print(f"\nSaved in {OUT}. ZIP files must be opened and the right small icon selected manually.")
print("Do not automatically replace app logos until artwork, dimensions, and usage guidelines are reviewed.")
