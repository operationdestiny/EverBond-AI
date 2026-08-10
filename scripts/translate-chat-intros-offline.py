#!/usr/bin/env python3
"""Offline, resumable EverBond chat-intro translation.

Translates ONLY opening_scenario and first_message for official active companions.
Uses facebook/m2m100_418M locally on the GitHub Actions CPU runner.
No Venice/OpenAI/paid translation API is called.
"""

import hashlib
import json
import os
import re
import sys
import time
from typing import Dict, List, Tuple

import requests
import torch
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

SUPABASE_URL = (
    os.environ.get("SUPABASE_URL")
    or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    or ""
).rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
REQUESTED_LANGUAGE = os.environ.get("CHAT_TRANSLATION_LANGUAGE", "ES").upper()
MAX_CHARACTERS = max(int(os.environ.get("CHAT_TRANSLATION_MAX_CHARACTERS", "0")), 0)
MODEL_NAME = "facebook/m2m100_418M"

TARGETS: Dict[str, str] = {
    "ES": "es",
    "FR": "fr",
    "DE": "de",
    "JA": "ja",
    "KO": "ko",
}

if not SUPABASE_URL:
    raise SystemExit("Missing SUPABASE_URL.")
if not SUPABASE_SERVICE_ROLE_KEY:
    raise SystemExit("Missing SUPABASE_SERVICE_ROLE_KEY.")
if REQUESTED_LANGUAGE not in set(TARGETS) | {"ALL"}:
    raise SystemExit("CHAT_TRANSLATION_LANGUAGE must be ES, FR, DE, JA, KO, or ALL.")

session = requests.Session()
session.headers.update(
    {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
    }
)


def rest_url(table: str) -> str:
    return f"{SUPABASE_URL}/rest/v1/{table}"


def fetch_all(table: str, select: str, extra_params: Dict[str, str], page_size: int = 1000) -> List[dict]:
    rows: List[dict] = []
    offset = 0
    while True:
        params = {"select": select, "limit": str(page_size), "offset": str(offset), **extra_params}
        response = session.get(rest_url(table), params=params, timeout=60)
        response.raise_for_status()
        page = response.json()
        rows.extend(page)
        if len(page) < page_size:
            break
        offset += page_size
    return rows


def upsert_translation(row: dict) -> None:
    response = session.post(
        rest_url("character_chat_translations"),
        params={"on_conflict": "character_id,language"},
        headers={
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        },
        json=[row],
        timeout=60,
    )
    response.raise_for_status()


def source_hash(character: dict) -> str:
    payload = {
        "character_id": character["id"],
        "opening_scenario": character.get("opening_scenario") or "",
        "first_message": character.get("first_message") or "",
    }
    encoded = json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


SENTENCE_SPLIT = re.compile(r"(?<=[.!?。！？])\s+")


def split_long_piece(piece: str, max_chars: int = 850) -> List[str]:
    piece = piece.strip()
    if not piece:
        return []
    if len(piece) <= max_chars:
        return [piece]

    sentences = SENTENCE_SPLIT.split(piece)
    chunks: List[str] = []
    current = ""

    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        if len(sentence) > max_chars:
            if current:
                chunks.append(current)
                current = ""
            for start in range(0, len(sentence), max_chars):
                chunks.append(sentence[start : start + max_chars])
            continue

        candidate = f"{current} {sentence}".strip()
        if len(candidate) <= max_chars:
            current = candidate
        else:
            if current:
                chunks.append(current)
            current = sentence

    if current:
        chunks.append(current)
    return chunks


def split_preserving_paragraphs(text: str) -> List[Tuple[str, bool]]:
    if not text:
        return []
    parts = re.split(r"(\n+)", text)
    output: List[Tuple[str, bool]] = []
    for part in parts:
        if not part:
            continue
        if part.startswith("\n"):
            output.append((part, True))
            continue
        chunks = split_long_piece(part)
        for index, chunk in enumerate(chunks):
            if index:
                output.append((" ", True))
            output.append((chunk, False))
    return output


print(f"Loading offline translation model: {MODEL_NAME}", flush=True)
tokenizer = M2M100Tokenizer.from_pretrained(MODEL_NAME)
model = M2M100ForConditionalGeneration.from_pretrained(MODEL_NAME, low_cpu_mem_usage=True)
model.eval()
torch.set_num_threads(max(1, min(os.cpu_count() or 2, 4)))


@torch.inference_mode()
def translate_pieces(pieces: List[str], target_code: str) -> List[str]:
    if not pieces:
        return []
    tokenizer.src_lang = "en"
    translated: List[str] = []
    batch_size = 8
    for start in range(0, len(pieces), batch_size):
        batch = pieces[start : start + batch_size]
        encoded = tokenizer(
            batch,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=900,
        )
        generated = model.generate(
            **encoded,
            forced_bos_token_id=tokenizer.get_lang_id(target_code),
            max_new_tokens=900,
            num_beams=2,
            do_sample=False,
        )
        translated.extend(tokenizer.batch_decode(generated, skip_special_tokens=True))
    return translated


def translate_field(text: str, target_code: str) -> str:
    structure = split_preserving_paragraphs(text)
    translatable = [piece for piece, is_separator in structure if not is_separator]
    translated = iter(translate_pieces(translatable, target_code))
    rebuilt: List[str] = []
    for piece, is_separator in structure:
        rebuilt.append(piece if is_separator else next(translated))
    return "".join(rebuilt).strip()


print("Loading active official EverBond companions from Supabase...", flush=True)
characters = fetch_all(
    "characters",
    "id,name,opening_scenario,first_message",
    {"is_active": "eq.true", "official": "eq.true", "order": "id.asc"},
)
print(f"Found {len(characters)} active official companions.", flush=True)

languages = list(TARGETS.keys()) if REQUESTED_LANGUAGE == "ALL" else [REQUESTED_LANGUAGE]

for language in languages:
    target_code = TARGETS[language]
    print(f"\n=== {language} ===", flush=True)

    existing_rows = fetch_all(
        "character_chat_translations",
        "character_id,source_hash",
        {"language": f"eq.{language}", "order": "character_id.asc"},
    )
    existing_by_id = {row["character_id"]: row.get("source_hash") for row in existing_rows}

    candidates = []
    for character in characters:
        current_hash = source_hash(character)
        if existing_by_id.get(character["id"]) == current_hash:
            continue
        candidates.append((character, current_hash))

    if MAX_CHARACTERS > 0:
        candidates = candidates[:MAX_CHARACTERS]

    print(
        json.dumps(
            {
                "event": "EVERBOND_OFFLINE_CHAT_TRANSLATION_START",
                "language": language,
                "model": MODEL_NAME,
                "candidates": len(candidates),
                "maxCharacters": MAX_CHARACTERS or "all",
            },
            indent=2,
        ),
        flush=True,
    )

    completed = 0
    failed = 0

    for character, current_hash in candidates:
        character_id = character["id"]
        try:
            opening = character.get("opening_scenario") or ""
            first = character.get("first_message") or ""
            translated_opening = translate_field(opening, target_code)
            translated_first = translate_field(first, target_code)

            if not translated_opening or not translated_first:
                raise RuntimeError("Offline model returned empty translation.")

            upsert_translation(
                {
                    "character_id": character_id,
                    "language": language,
                    "source_hash": current_hash,
                    "opening_scenario": translated_opening,
                    "first_message": translated_first,
                    "translator": MODEL_NAME,
                    "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                }
            )
            completed += 1

            if completed % 10 == 0:
                print(
                    json.dumps(
                        {
                            "event": "EVERBOND_OFFLINE_CHAT_TRANSLATION_PROGRESS",
                            "language": language,
                            "completed": completed,
                            "failed": failed,
                            "remaining": max(len(candidates) - completed - failed, 0),
                        }
                    ),
                    flush=True,
                )
        except Exception as exc:
            failed += 1
            print(
                json.dumps(
                    {
                        "event": "EVERBOND_OFFLINE_CHAT_TRANSLATION_ERROR",
                        "language": language,
                        "characterId": character_id,
                        "error": str(exc)[:500],
                    }
                ),
                file=sys.stderr,
                flush=True,
            )

    print(
        json.dumps(
            {
                "event": "EVERBOND_OFFLINE_CHAT_TRANSLATION_FINISH",
                "language": language,
                "completed": completed,
                "failed": failed,
                "attempted": len(candidates),
            },
            indent=2,
        ),
        flush=True,
    )

    if failed:
        print(f"{language}: {failed} character(s) need a rerun.", file=sys.stderr)
