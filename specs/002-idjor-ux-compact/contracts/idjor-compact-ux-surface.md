# Contract: PHASE 2B.6 IDJOR Compact UX Surface

## Purpose

Define the frontend-only polish contract for `/fr/idjor` while keeping the same
backend reads and read-only posture.

## Surface Rules

- `/fr/idjor` remains the only page for this foundation surface
- the backend contract stays unchanged
- the page first shows an executive summary
- technical sections remain accessible lower on the same page

## Required Sections

- Synthese
- Agents
- Moteurs
- Tools
- Flags
- Providers / Models
- Securite

## Required Summary Signals

The top summary must clearly communicate:

- IDJOR is ready on the technical foundation side
- LLM OFF
- Vector Store OFF
- Decisioning OFF
- Registry read-only
- Institution remains decision-maker

## Required Compact Behavior

- default vertical footprint is reduced versus the previous version
- large detail blocks use collapsible sections, bounded internal scroll, or both
- all technical data remains reachable without new backend requests

## Forbidden Changes

- no backend modification
- no route modification
- no AI provider client
- no vector client
- no activation button
- no decision, scoring, pricing, eligibility, policy, or indemnity action
- no “LIVE IA” wording for this surface
