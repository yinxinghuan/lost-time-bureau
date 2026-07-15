#!/usr/bin/env python3
"""Generate time-case instruction-manual plates through Aigram transit."""

import argparse
import json
import subprocess
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
OUTPUT = ROOT / "public" / "manual"
LOG = ROOT / "_assets" / "manual-generation.json"

STYLE = (
    "Wordless square technical cutaway illustration printed on warm ivory fibrous paper. "
    "Deep midnight-navy engraved copperplate linework; "
    "very sparse oxidized-copper arrows, circles, and hatch accents. Flat orthographic cutaway or "
    "cause-and-effect diagram, one bold focal event, clear silhouettes and generous negative space, "
    "readable when cropped to a small mobile card. Serious humane speculative-history mood. The paper "
    "extends beyond all four edges: no page edge, no decorative frame, no title area, no footer. "
    "The image contains ZERO typography: no labels, no text, no letters, no dates, no numerals, no "
    "glyphs, no emblems, no watermark, no writing printed on depicted objects. "
    "Not photorealistic, not 3D, not cyberpunk, not steampunk, not anime, no modern infographic icons."
)

SCENES = {
    "lin-mo-object": (
        "An exploded-view brass tram ticket punch with worn hinge, spring, handle, and punched paper ticket "
        "separated into four clear parts, with subtle wear rings and one inspection arrow. All surfaces blank."
    ),
    "lin-mo-memory": (
        "A continuous single-line sequence: dark tram tunnel, sudden loss of overhead power, tilting carriage, "
        "and the small silhouette of a child behind a blocked door. One unbroken copper path joins every event."
    ),
    "lin-mo-echo": (
        "A damaged early electric tram shown in clean side cutaway. At the center, a uniformed Chinese "
        "conductor braces both feet and physically forces open a warped carriage door while a compact "
        "group of passenger silhouettes escapes through the opening behind him. One simple copper cause "
        "arrow leads toward a quiet memorial silhouette, making rescue followed by the conductor's "
        "sacrifice immediately understandable. Keep every vehicle surface completely blank."
    ),
    "ada-voss-object": (
        "An unfurled translucent polymer river map in cutaway, salt-like ink crystals marking a buried river "
        "beneath simplified city foundations; beside it, a small groundwater probe shows the same contour."
    ),
    "ada-voss-memory": (
        "One woman's silhouette linked by an unbroken copper route through three successive flood-water levels, "
        "ending at a childhood house ghosted beneath the outline of a present-day railway station."
    ),
    "ada-voss-echo": (
        "A buried river beneath city streets forks into two clear outcomes: dredged open channel and safe homes "
        "on one side, an empty rolled future map and absent surveyor's desk on the other."
    ),
    "zhen-ye-object": (
        "A hospital bassinet in section view between two authentic paper records, one life pulse and one flat line, "
        "with a DNA double helix linking both contradictory records to the same adult silhouette."
    ),
    "zhen-ye-memory": (
        "A doctor silhouette at the center of one continuous branching memory path, tending several distinct patient "
        "silhouettes while his own childhood home appears as a translucent impossible layer behind him."
    ),
    "zhen-ye-echo": (
        "A physician with a stethoscope stands between an unpowered infant incubator and a row of surviving patient "
        "silhouettes; a copper causal thread connects lives that should have no doctor."
    ),
    "armand-kline-object": (
        "Exploded cutaway of a self-healing concrete block: cracked surface, embedded bacterial capsules, and the "
        "same crack closing across three clean stages while flood water presses against the sample."
    ),
    "armand-kline-memory": (
        "A thoughtful engineer silhouette whose head and torso contain a miniature city section; several streets "
        "shift position along a copper trace while one foundation remains fixed."
    ),
    "armand-kline-echo": (
        "City ground in deep section: existing streets above and a vast second structural layer being built below. "
        "One causal fork shows the undercity resisting flood water, the other shows it diverting water toward homes."
    ),
    "qiu-lan-object": (
        "Exploded arrangement of a worn nurse's medical bag, old brass house key, and blank enamel street plate, "
        "all connected by one copper address line that ends at an empty place on a city map."
    ),
    "qiu-lan-memory": (
        "A vanished narrow stone street seen in perspective, repeated as the same translucent dream above a large "
        "crowd of sleeping citizen silhouettes; identical window light connects them."
    ),
    "qiu-lan-echo": (
        "One city block morphs between two mutually exclusive layers: a warm narrow residential street with many "
        "lit windows and a modern station occupying exactly the same footprint, joined by a copper flip arrow."
    ),
    "mara-9-object": (
        "Two equal human silhouettes in flight suits face each other, each surrounded by the same unusual atomic "
        "orbit pattern; a laboratory scanner confirms perfect symmetry without showing any artificial copy."
    ),
    "mara-9-memory": (
        "A single astronaut path approaches a gravitational planet-sling arc and divides cleanly into two unbroken "
        "parallel life paths, each accumulating different small domestic and spaceflight memories."
    ),
    "mara-9-echo": (
        "Two identical but individually worn astronauts meet at opposite sides of one spacecraft airlock; one legal "
        "identity seal above them has room for only one silhouette while both cast real shadows."
    ),
    "director-zero-object": (
        "Exploded technical view of an antique municipal brass seal and its metal die, with a material synthesis vessel "
        "on one side and deep decades of wear on the other, connected in an impossible reverse order."
    ),
    "director-zero-memory": (
        "A seated civil servant at an archive desk makes several case decisions while a severe older observer behind "
        "frosted glass traces the exact same decision path before each hand reaches the stamp."
    ),
    "director-zero-echo": (
        "A circular institutional cause diagram: a time fracture creates a bureau building, the bureau manufactures "
        "the same fracture, and many displaced human silhouettes stand inside the loop; one break closes the circle "
        "but makes those people fade, while keeping it open preserves them."
    ),
}


def generate(prompt: str, retries: int = 3) -> str:
    data = json.dumps({"prompt": prompt}, ensure_ascii=False)
    last = None
    for attempt, delay in enumerate((3, 8, 15), start=1):
        try:
            response = subprocess.run(
                [
                    "curl", "-fsS", "--max-time", "360", API_URL,
                    "-H", f"Content-Type: {HEADERS['Content-Type']}",
                    "-H", f"Origin: {HEADERS['Origin']}",
                    "-H", f"Referer: {HEADERS['Referer']}",
                    "-H", f"User-Agent: {HEADERS['User-Agent']}",
                    "--data-binary", data,
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
            print(f"retry {attempt}/{retries}: {exc}", flush=True)
            if attempt < retries:
                time.sleep(delay)
    raise last or RuntimeError("generation failed")


def download_as_jpeg(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_suffix(".source")
    subprocess.run(
        ["curl", "-fsSL", "--max-time", "120", "-A", "Mozilla/5.0", url, "-o", str(temporary)],
        check=True,
        capture_output=True,
    )
    subprocess.run(
        ["sips", "-s", "format", "jpeg", "-s", "formatOptions", "84", "-Z", "768", str(temporary), "--out", str(destination)],
        check=True,
        capture_output=True,
    )
    subprocess.run(
        ["sips", "-c", "560", "768", str(destination), "--out", str(destination)],
        check=True,
        capture_output=True,
    )
    temporary.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=sorted(SCENES))
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    jobs = {args.only: SCENES[args.only]} if args.only else SCENES
    records = []
    for index, (key, scene) in enumerate(jobs.items(), start=1):
        destination = OUTPUT / f"{key}.jpg"
        if destination.exists() and not args.force:
            print(f"[{index}/{len(jobs)}] skip {destination.name}", flush=True)
            continue
        prompt = f"{STYLE} Scene: {scene}"
        print(f"[{index}/{len(jobs)}] generating {destination.name}", flush=True)
        url = generate(prompt)
        download_as_jpeg(url, destination)
        records.append({
            "file": str(destination.relative_to(ROOT)),
            "url": url,
            "endpoint": API_URL,
            "origin": HEADERS["Origin"],
            "prompt": prompt,
        })
        print(f"saved {destination}", flush=True)
        time.sleep(2)
    previous = json.loads(LOG.read_text()) if LOG.exists() else []
    LOG.write_text(json.dumps(previous + records, ensure_ascii=False, indent=2) + "\n")


if __name__ == "__main__":
    main()
