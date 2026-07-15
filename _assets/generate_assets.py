#!/usr/bin/env python3
"""Generate production portraits and poster through the Aigram transit endpoint."""

import json
import os
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

API_URL = "https://chat.aiwaves.tech/aigram/api/gen-image"
HEADERS = {
    "Content-Type": "application/json",
    "Origin": "https://aigram.app",
    "Referer": "https://aigram.app/",
    "User-Agent": "Mozilla/5.0",
}
ROOT = Path(__file__).resolve().parents[1]
PORTRAITS = ROOT / "public" / "portraits"
POSTER = ROOT / "public" / "poster.png"
LOG = ROOT / "_assets" / "transit-generation.json"

STYLE = (
    "narrative editorial science-fiction illustration, grounded retro-futurist municipal archive, "
    "midnight navy blue, oxidized brass and warm paper palette, subtle painterly texture, "
    "credible human anatomy, cinematic soft desk-lamp key light from upper left and cold blue city rim light, "
    "quiet institutional mood, serious humane expression, square 1024x1024 composition filling the entire frame, "
    "no border, no text, no logo, no watermark, NOT cyberpunk, NOT steampunk, NOT anime, NOT photorealistic"
)

CHARACTERS = {
    "lin-mo.png": "Chinese man age 36, 1937 tram conductor, short dark hair, tired attentive eyes, dark teal period uniform jacket, cream shirt, narrow burgundy tie, small brass ticket punch badge, chest-up frontal portrait behind frosted archive glass",
    "ada-voss.png": "German woman age 42, hydrographic cartographer from 2096, cropped ash-blonde hair, weathered intelligent face, practical slate-blue future field coat with fine brass map fasteners, holding a translucent rolled flood map, chest-up frontal portrait behind frosted archive glass",
    "zhen-ye.png": "Chinese family physician with a calm compassionate face and slightly wavy black hair, wearing a plain dark navy medical jacket and stethoscope, tight chest-up frontal identity portrait, head and shoulders fill the frame, simple blue frosted archive glass background",
    "armand-kline.png": "French man age 58, structural engineer from 2124, silver hair and trimmed beard, broad thoughtful face, charcoal work coat with restrained geometric seams and a small concrete sample case, chest-up frontal portrait behind frosted archive glass",
    "qiu-lan.png": "Chinese woman age 63, neighborhood nurse from 1967, composed face with fine age lines, dark indigo period coat, cream scarf, holding a worn brown medical bag and an old brass house key, chest-up frontal portrait behind frosted archive glass",
    "mara-9.png": "Black woman age 39, deep-space returnee from 2188, close-cropped natural hair, steady guarded eyes, utilitarian deep navy flight suit with one pale ceramic collar ring and no helmet, chest-up frontal portrait behind frosted archive glass",
    "director-zero.png": "androgynous East Asian person appearing age 55, founder of a time settlement bureau, severe but sorrowful face, salt-and-pepper hair swept back, formal midnight-blue civil-service coat with one antique brass seal, chest-up frontal portrait behind frosted archive glass",
}

POSTER_PROMPT = (
    "Square narrative key art for a philosophical time-travel decision game. A lone midnight civil servant sits at "
    "a dark wooden archive desk in the lower center, facing a frosted brass-framed service window. Behind the glass "
    "stands a displaced 1930s tram conductor, divided by a thin vertical amber time fracture. On the left half beyond "
    "him is a rain-soaked 1937 tram crash; on the right half is a vast 2049 night city with one buried river glowing "
    "under the streets. Brass timeline instruments and paper files frame the scene without looking like interface UI. "
    "Strong emotional conflict, one human life weighed against a city history, subject and faces kept centrally framed. "
    "Large clean title at the very top in a generous safe area, with no symbols or marks above it: "
    "THE LOST TIME OFFICE. Small Chinese subtitle directly below: 时间遗失处. Typography legible, ivory engraved serif. "
    "Midnight navy, oxidized brass, amber and paper palette, painterly editorial science-fiction poster, atmospheric, "
    "not cyberpunk, not steampunk, no UI screenshot, no border, no watermark, no date, no year, no numerals anywhere, "
    "only the requested English title and Chinese subtitle, high-resolution square image, fills frame edge to edge."
)


def generate(prompt: str, retries: int = 3) -> str:
    data = json.dumps({"prompt": prompt}).encode()
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(API_URL, data=data, method="POST", headers=HEADERS)
            with urllib.request.urlopen(req, timeout=360) as response:
                body = json.loads(response.read())
            url = body.get("url")
            if not url:
                raise RuntimeError(f"No URL in response: {body}")
            return url
        except Exception as exc:
            last = exc
            print(f"retry {attempt + 1}/{retries}: {exc}", flush=True)
            time.sleep((3, 8, 15)[attempt])
    raise last or RuntimeError("generation failed")


def download(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=90) as response:
        data = response.read()
    source_ext = os.path.splitext(url.split("?")[0])[1].lower()
    if source_ext == ".png":
        destination.write_bytes(data)
        return
    temp = destination.with_suffix(source_ext or ".jpg")
    temp.write_bytes(data)
    subprocess.run(["sips", "-s", "format", "png", str(temp), "--out", str(destination)], check=True, capture_output=True)
    temp.unlink(missing_ok=True)


def main() -> None:
    records = []
    jobs = [(PORTRAITS / name, f"{STYLE}. Character: {description}.") for name, description in CHARACTERS.items()]
    jobs.append((POSTER, POSTER_PROMPT))
    for index, (output, prompt) in enumerate(jobs, start=1):
        if output.exists():
            print(f"[{index}/{len(jobs)}] skip existing {output.name}", flush=True)
            continue
        print(f"[{index}/{len(jobs)}] generating {output.name}", flush=True)
        url = generate(prompt)
        download(url, output)
        records.append({"file": str(output.relative_to(ROOT)), "url": url, "endpoint": API_URL, "origin": HEADERS["Origin"], "prompt": prompt})
        print(f"saved {output}", flush=True)
        time.sleep(2)
    previous = []
    if LOG.exists():
        previous = json.loads(LOG.read_text())
    LOG.write_text(json.dumps(previous + records, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
