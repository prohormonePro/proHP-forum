# SOVEREIGN_L5 ORGANISM - OPERATOR GUIDE

## Quick Start

    python launch_organism.py --launch

One command boots the entire organism.

## Dashboard

    python dashboard.py --show

One screen: health bar, autonomy, services, tests, proofs, dispatch.

## Commands

    python simple_commands.py --run health      Health score 0-100
    python simple_commands.py --run test         18-module test suite
    python simple_commands.py --run check        Autonomy verification (6 checks)
    python simple_commands.py --run fix          Auto-fix dead services
    python simple_commands.py --run reflect      Self-reflection report
    python simple_commands.py --run bench        Benchmark core ops
    python simple_commands.py --run proofs       Proof integrity check
    python simple_commands.py --run perf         Performance analysis
    python simple_commands.py --run status       Full organism summary
    python simple_commands.py --run start        Launch organism

## Guided Tasks

    python guided_tasks.py --run morning_check      4 steps - daily
    python guided_tasks.py --run full_diagnostic     7 steps - weekly
    python guided_tasks.py --run quick_fix           2 steps - when needed

## Workflow

  Daily: morning_check
  Weekly: full_diagnostic + perf
  After updates: test suite
  Before handover: python _490_handoff.py

## Key State Files

  state/health_score.json         Health 0-100 with grade
  state/autonomy_gate.json        Autonomy verdict (6 checks)
  state/module_test_results.json  18-module test results
  state/proof_integrity.json      Proof file validation
  state/reflection_report.json    Self-analysis + recommendations
  state/perf_analysis.json        Performance metrics
  state/operator_handoff.json     Full handoff snapshot
  state/dispatch_log.json         Broadcast dispatch history
  state/failure_ledger.json       Failure event history

## Architecture

  Spine: NVMe (S:\PROHP_DATA) or local state/proofs
  Body: Current host machine (travisHP = primary)
  Interface: Telegram bot (primary), terminal (secondary)
  Launch: One command, one .bat file
  Modes: PRIMARY_READY / FALLBACK_READY / LOCAL_ONLY

## Troubleshooting

  Services down: python simple_commands.py --run fix
  Health degraded: python guided_tasks.py --run morning_check
  Module test fails: check state/module_test_results.json
  Dispatch failures: check state/dispatch_log.json
  Proof corruption: python simple_commands.py --run proofs

## Anchor: E3592DC3
