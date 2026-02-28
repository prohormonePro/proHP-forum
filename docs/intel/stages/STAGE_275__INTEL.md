# STAGE_275 — GrepGate CTA Funnel Parity
ANCHOR: E3592DC3
Commit: 2fba398b | Tag: SWARM_20260228_231556

## Problem
GrepGateCTA "Start Here" routed cold traffic to /register (dead-end).

## Fix
GrepGateCTA.jsx: not logged in routes to /compounds. Button copy: Join Inner Circle.
