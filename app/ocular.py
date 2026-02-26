#!/usr/bin/env python3

import argparse
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
import urllib.request
import urllib.error
from playwright.sync_api import sync_playwright

def check_reachability(base_url, timeout_sec=10):
    try:
        req = urllib.request.Request(base_url, method='GET', headers={'User-Agent': 'Mozilla/5.0 OcularNode/1.0'})
        with urllib.request.urlopen(req, timeout=timeout_sec) as resp:
            return resp.status < 500
    except urllib.error.HTTPError as e:
        return e.code < 500
    except (urllib.error.URLError, OSError):
        return False

def route_to_slug(route):
    slug = route.strip('/')
    if not slug:
        return "home"
    slug = slug.replace('/', '_')
    slug = slug.replace('-', '_')
    return slug

def capture_route(page, base_url, route, viewport_name, stage, out_root, timeout_ms, full_page):
    url = f"{base_url.rstrip('/')}{route}"
    try:
        page.goto(url, wait_until="networkidle", timeout=timeout_ms)
    except Exception:
        page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
        page.wait_for_timeout(1000)
    route_slug = route_to_slug(route)
    filename = f"{viewport_name}_window_{route_slug}.png"
    before_dir = Path(out_root) / stage / "before"
    before_dir.mkdir(parents=True, exist_ok=True)
    screenshot_path = before_dir / filename
    page.screenshot(path=str(screenshot_path), full_page=full_page)
    return str(screenshot_path)

def main():
    parser = argparse.ArgumentParser(description='OCULAR_NODE_INFRASTRUCTURE')
    parser.add_argument('--baseUrl', default='https://forum.prohormonepro.com',
                       help='Base URL for forum')
    parser.add_argument('--stage', default='baseline',
                       help='Stage folder name')
    parser.add_argument('--out', default='artifacts/ocular',
                       help='Output root directory')
    parser.add_argument('--timeoutMs', type=int, default=45000,
                       help='Navigation timeout in milliseconds')
    parser.add_argument('--fullPage', action=argparse.BooleanOptionalAction, default=True,
                       help='Enable/disable full-page screenshots (default: enabled). Use --no-fullPage to disable.')

    args = parser.parse_args()

    # Preflight skip: on srv2, Nginx may redirect HTTP->HTTPS or reject urllib.
    # Playwright handles redirects natively, so we trust it.
    if not check_reachability(args.baseUrl):
        print(f"WARN: preflight failed for {args.baseUrl}, proceeding anyway (Playwright handles redirects)")

    routes = [
        "/",
        "/compounds",
        "/compounds/lgd-4033"
    ]

    viewports = [
        {"name": "desktop", "width": 1920, "height": 1080},
        {"name": "mobile", "width": 390, "height": 844}
    ]

    generated_files = []
    playwright_instance = None
    browser = None

    try:
        playwright_instance = sync_playwright().start()
        browser = playwright_instance.chromium.launch()
        first_context = True
        trace_context = None

        for viewport in viewports:
            context = browser.new_context(
                viewport={"width": viewport["width"], "height": viewport["height"]},
                device_scale_factor=1, ignore_https_errors=True
            )
            if first_context:
                context.tracing.start(screenshots=True, snapshots=True, sources=True)
                trace_context = context
                first_context = False

            page = context.new_page()

            for route in routes:
                screenshot_path = capture_route(
                    page, args.baseUrl, route, viewport["name"],
                    args.stage, args.out, args.timeoutMs, args.fullPage
                )
                rel_path = str(Path(screenshot_path).relative_to(Path(args.out)))
                generated_files.append(rel_path)

            if context == trace_context:
                trace_dir = Path(args.out) / args.stage
                trace_dir.mkdir(parents=True, exist_ok=True)
                trace_path = trace_dir / "trace.zip"
                trace_context.tracing.stop(path=str(trace_path))
                generated_files.append(str(trace_path.relative_to(Path(args.out))))
            context.close()
            generated_files.append(str(trace_path.relative_to(Path(args.out))))

    finally:
        if browser:
            browser.close()
        if playwright_instance:
            playwright_instance.stop()

    receipt = {
        "ts_iso": datetime.now(timezone.utc).isoformat(),
        "baseUrl": args.baseUrl,
        "stage": args.stage,
        "out_root": args.out,
        "gate_state": "window",
        "viewports": [{"width": vp["width"], "height": vp["height"]} for vp in viewports],
        "routes": routes,
        "generated_files": generated_files,
        "notes": "Phase 1 WINDOW only - unauthenticated first-visit baseline"
    }

    receipt_path = Path(args.out) / args.stage / "run_receipt.json"
    receipt_path.parent.mkdir(parents=True, exist_ok=True)

    with open(receipt_path, 'w') as f:
        json.dump(receipt, f, indent=2)

    generated_files.append(str(receipt_path.relative_to(Path(args.out))))

if __name__ == "__main__":
    main()
