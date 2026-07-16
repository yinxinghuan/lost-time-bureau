#!/usr/bin/env python3
"""Generate production portraits and poster through the Aigram transit endpoint."""

import json
import os
import subprocess
import sys
import time
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
PUBLIC_POSTER_REF = "https://yinxinghuan.github.io/lost-time-bureau/poster.png"

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
    "Edit the reference into polished square narrative key art for an international English-language audience. "
    "Preserve the midnight civil servant at the dark wooden archive desk, the brass-framed service window, the "
    "displaced tram conductor, the vertical amber time fracture, the rainy historic tram scene, the future night city, "
    "and the midnight navy, oxidized brass, amber and warm paper palette. Keep the scene painterly, cinematic, serious "
    "and humane. At the very top, retain one exact, large, highly legible ivory engraved-serif title: "
    "THE LOST TIME OFFICE. Remove the Chinese subtitle completely. Remove every other word, letter, number, date, "
    "label, glyph, pseudo-text and writing from the entire image, including the tram, buildings, instruments, files, "
    "drawers and margins. English title only. No subtitle. No logo. No watermark. No border. No interface UI. "
    "High-resolution square image filling the frame edge to edge."
)


def generate(prompt: str, ref_url: str | None = None, retries: int = 3) -> str:
    payload = {"prompt": prompt}
    if ref_url:
        payload["ref_url"] = ref_url
    data = json.dumps(payload).encode()
    last = None
    for attempt in range(retries):
        try:
            response = subprocess.run(
                [
                    "curl",
                    "-fsSL",
                    "--max-time",
                    "360",
                    "-X",
                    "POST",
                    API_URL,
                    "-H",
                    f"Content-Type: {HEADERS['Content-Type']}",
                    "-H",
                    f"Origin: {HEADERS['Origin']}",
                    "-H",
                    f"Referer: {HEADERS['Referer']}",
                    "-H",
                    f"User-Agent: {HEADERS['User-Agent']}",
                    "--data-binary",
                    data.decode(),
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            body = json.loads(response.stdout)
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
    source_ext = os.path.splitext(url.split("?")[0])[1].lower()
    temp = destination if source_ext == ".png" else destination.with_suffix(source_ext or ".jpg")
    subprocess.run(
        ["curl", "-fsSL", "--max-time", "90", "-A", HEADERS["User-Agent"], url, "-o", str(temp)],
        check=True,
    )
    if source_ext == ".png":
        return
    subprocess.run(["sips", "-s", "format", "png", str(temp), "--out", str(destination)], check=True, capture_output=True)
    temp.unlink(missing_ok=True)


def main() -> None:
    poster_only = "--poster" in sys.argv
    force = "--force" in sys.argv
    records = []
    jobs = [] if poster_only else [
        (PORTRAITS / name, f"{STYLE}. Character: {description}.", None)
        for name, description in CHARACTERS.items()
    ]
    jobs.append((POSTER, POSTER_PROMPT, PUBLIC_POSTER_REF))
    for index, (output, prompt, ref_url) in enumerate(jobs, start=1):
        if output.exists() and not force:
            print(f"[{index}/{len(jobs)}] skip existing {output.name}", flush=True)
            continue
        print(f"[{index}/{len(jobs)}] generating {output.name}", flush=True)
        url = generate(prompt, ref_url=ref_url)
        download(url, output)
        records.append({
            "file": str(output.relative_to(ROOT)),
            "url": url,
            "endpoint": API_URL,
            "origin": HEADERS["Origin"],
            "ref_url": ref_url,
            "prompt": prompt,
        })
        print(f"saved {output}", flush=True)
        time.sleep(2)
    previous = []
    if LOG.exists():
        previous = json.loads(LOG.read_text())
    LOG.write_text(json.dumps(previous + records, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
