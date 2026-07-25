# Family Language OS v6 — Product Architecture

## Product ruling
v5 was a functional demonstrator. v6 is a rebuild into a data-driven learning operating system.

## Core navigation
1. Today — adaptive ten-step session
2. Path — complete CEFR map A0–C2 (plus PRE for age 3)
3. Practice — skill labs, error book, SRS, missions
4. Library — professional and life tracks
5. Family — four independent learning records
6. Me — settings, PWA acceptance, backup and two-device sync

## Learner models
- Saeed: English B1→C1/C2; IELTS, PhD, research, HSE/mining; German A0→B2.
- Arzoo: English/German A1→B2; everyday life, grocery/kitchen, school communication, IT career.
- Elena (11): A0→B1 school-age path; alphabet, phonics, stories, science, projects and digital safety.
- Arya (3): PRE parent-guided exposure; 5–8 minute sound, movement and picture sessions; no formal testing.

## Content model
Language → Level → Unit → lesson blueprints → generated daily task → attempt/event → mastery/error/SRS.
Every unit has a functional project and mastery threshold. Opening a screen does not count as learning.

## Release gates
SOURCE → SYNTAX → STATIC SERVER → BROWSER RUNTIME → ROUTES → TASK COMPLETION → STORAGE ROUNDTRIP → OFFLINE → REAL DEVICE → TWO-DEVICE SYNC → FAMILY ACCEPTANCE.
