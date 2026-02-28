# STAGE_029 — Stripe Lead Checkout Self-Healing
ANCHOR: E3592DC3
Commit: 2c1fbb65 | Tag: SWARM_20260228_211946

## Problem
Legacy prohp_lead_access cookies had {lead:true} but missing email, causing "Email required for checkout."

## Fix
Backend: if leadEmail unresolvable, clear stale cookie server-side (flag-matched clearCookie) and return {action:'recapture'}.
Frontend: on recapture, route to /compounds email gate.

## Result
No infinite loops. Normal users enter email once. Legacy cookies self-heal.
