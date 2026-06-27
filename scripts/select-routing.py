#!/usr/bin/env python3
import os
import sys
import json
import shutil
import argparse
import datetime

# Strategy configurations mapping
STRATEGIES = {
    "explicit": {
        "files": {
            "vite.config.ts": "scripts/templates/explicit/vite.config.ts",
            "tsconfig.app.json": "scripts/templates/explicit/tsconfig.app.json",
            "index.html": "scripts/templates/explicit/index.html",
            "src/main.tsx": "scripts/templates/explicit/src/main.tsx",
            "src/App.tsx": "scripts/templates/explicit/src/App.tsx",
            "src/router.tsx": "scripts/templates/explicit/src/router.tsx",
        },
        "cleanup": [
            "src/root.tsx",
            "src/routes.ts",
            "src/pages/DashboardRedirect.tsx",
            "react-router.config.ts",
            "src/entry.client.tsx",
            "src/react-pages.d.ts",
        ],
        "package_json": {
            "dependencies": {
                "react-router": "^7.6.1",
            },
            "devDependencies": {
                "@vitejs/plugin-react": "^4.5.2",
            },
            "remove_dependencies": [
                "vite-plugin-pages",
                "@react-router/dev",
                "vite-tsconfig-paths",
                "@react-router/node",
                "isbot",
            ],
            "scripts": {
                "dev": "vite",
                "build": "tsc -b && vite build",
            }
        }
    },
    "vite-plugin-pages": {
        "files": {
            "vite.config.ts": "scripts/templates/vite-plugin-pages/vite.config.ts",
            "tsconfig.app.json": "scripts/templates/vite-plugin-pages/tsconfig.app.json",
            "index.html": "scripts/templates/vite-plugin-pages/index.html",
            "src/main.tsx": "scripts/templates/vite-plugin-pages/src/main.tsx",
            "src/App.tsx": "scripts/templates/vite-plugin-pages/src/App.tsx",
            "src/router.tsx": "scripts/templates/vite-plugin-pages/src/router.tsx",
            "src/react-pages.d.ts": "scripts/templates/vite-plugin-pages/src/react-pages.d.ts",
        },
        "cleanup": [
            "src/root.tsx",
            "src/routes.ts",
            "src/pages/DashboardRedirect.tsx",
            "react-router.config.ts",
            "src/entry.client.tsx",
        ],
        "package_json": {
            "dependencies": {
                "react-router": "^7.6.1",
            },
            "devDependencies": {
                "@vitejs/plugin-react": "^4.5.2",
                "vite-plugin-pages": "^0.32.4",
            },
            "remove_dependencies": [
                "@react-router/dev",
                "vite-tsconfig-paths",
                "@react-router/node",
                "isbot",
            ],
            "scripts": {
                "dev": "vite",
                "build": "tsc -b && vite build",
            }
        }
    },
    "framework": {
        "files": {
            "vite.config.ts": "scripts/templates/framework/vite.config.ts",
            "tsconfig.json": "scripts/templates/framework/tsconfig.json",
            "tsconfig.app.json": "scripts/templates/framework/tsconfig.app.json",
            "react-router.config.ts": "scripts/templates/framework/react-router.config.ts",
            "src/root.tsx": "scripts/templates/framework/src/root.tsx",
            "src/entry.client.tsx": "scripts/templates/framework/src/entry.client.tsx",
            "src/routes.ts": "scripts/templates/framework/src/routes.ts",
            "src/pages/DashboardRedirect.tsx": "scripts/templates/framework/src/pages/DashboardRedirect.tsx",
        },
        "cleanup": [
            "index.html",
            "src/main.tsx",
            "src/App.tsx",
            "src/router.tsx",
            "src/react-pages.d.ts",
        ],
        "package_json": {
            "dependencies": {
                "react-router": "^7.6.1",
                "@react-router/node": "^7.6.1",
                "isbot": "^5.0.0",
            },
            "devDependencies": {
                "@react-router/dev": "^7.6.1",
                "vite-tsconfig-paths": "^5.1.4",
            },
            "remove_dependencies": [
                "@vitejs/plugin-react",
                "vite-plugin-pages",
            ],
            "scripts": {
                "dev": "react-router dev",
                "build": "react-router build",
            }
        }
    }
}

SETTINGS_FILE = "ai-settings.json"
PACKAGE_JSON = "package.json"

def detect_current_strategy():
    """Detects active strategy from ai-settings.json or heuristics."""
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                val = data.get("routing")
                if val in STRATEGIES:
                    return val
        except Exception:
            pass

    # Heuristic detection if settings file doesn't exist
    if os.path.exists("src/root.tsx") and os.path.exists("src/routes.ts"):
        return "framework"
    
    if os.path.exists("vite.config.ts"):
        with open("vite.config.ts", "r", encoding="utf-8") as f:
            content = f.read()
            if "vite-plugin-pages" in content:
                return "vite-plugin-pages"
                
    return "explicit"

def write_settings(strategy):
    """Writes selected strategy to ai-settings.json."""
    data = {}
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            pass
    data["routing"] = strategy
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")

def make_backup(prev_strategy):
    """Creates a backup of configuration files before modifying them."""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = os.path.join("scripts", "backups", f"{timestamp}_{prev_strategy}")
    os.makedirs(backup_dir, exist_ok=True)

    files_to_backup = [PACKAGE_JSON, "vite.config.ts", "tsconfig.json", "tsconfig.app.json"]
    # Add files owned by previous strategy
    if prev_strategy in STRATEGIES:
        files_to_backup.extend(STRATEGIES[prev_strategy]["files"].keys())

    backed_up = []
    for f in set(files_to_backup):
        if os.path.exists(f):
            dest = os.path.join(backup_dir, f)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            shutil.copy2(f, dest)
            backed_up.append(f)

    if backed_up:
        print(f"[*] Safely backed up existing config to: {backup_dir}")
    return backup_dir

def merge_package_json(strategy):
    """Updates package.json dependencies and scripts."""
    if not os.path.exists(PACKAGE_JSON):
        print(f"[!] Error: {PACKAGE_JSON} not found.", file=sys.stderr)
        return False

    try:
        with open(PACKAGE_JSON, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"[!] Error: {PACKAGE_JSON} contains invalid JSON: {e}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"[!] Error reading {PACKAGE_JSON}: {e}", file=sys.stderr)
        return False

    # Ensure required blocks exist
    data.setdefault("dependencies", {})
    data.setdefault("devDependencies", {})
    data.setdefault("scripts", {})

    cfg = STRATEGIES[strategy]["package_json"]

    # Add dependencies and remove from devDependencies to avoid duplication
    for dep, ver in cfg.get("dependencies", {}).items():
        data["dependencies"][dep] = ver
        data["devDependencies"].pop(dep, None)

    # Add devDependencies and remove from dependencies to avoid duplication
    for dep, ver in cfg.get("devDependencies", {}).items():
        data["devDependencies"][dep] = ver
        data["dependencies"].pop(dep, None)

    # Remove conflicting/obsolete dependencies
    for dep in cfg.get("remove_dependencies", []):
        data["dependencies"].pop(dep, None)
        data["devDependencies"].pop(dep, None)

    # Update script commands
    for name, cmd in cfg.get("scripts", {}).items():
        data["scripts"][name] = cmd

    # Sort packages alphabetically for neatness
    data["dependencies"] = dict(sorted(data["dependencies"].items()))
    data["devDependencies"] = dict(sorted(data["devDependencies"].items()))

    with open(PACKAGE_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")

    print("[*] Merged dependencies and scripts in package.json")
    return True

def apply_strategy(strategy, prev_strategy, force=False):
    """Performs the file swapping and cleanup operations."""
    if strategy == prev_strategy and not force:
        print(f"[*] Routing strategy '{strategy}' is already active.")
        return True

    # Validate that all source templates exist before making any changes
    cfg = STRATEGIES[strategy]
    for target, source in cfg["files"].items():
        if not os.path.exists(source):
            print(f"[!] Error: Source template '{source}' does not exist. Swapping aborted.", file=sys.stderr)
            return False

    print(f"[*] Switching routing strategy: {prev_strategy} -> {strategy}...")
    
    # 1. Backup before swap
    make_backup(prev_strategy)

    # 2. Clean up obsolete files for target strategy
    cleanup_list = STRATEGIES[strategy]["cleanup"]
    for f in cleanup_list:
        if os.path.exists(f):
            if os.path.isdir(f):
                shutil.rmtree(f)
            else:
                os.remove(f)
            print(f"[-] Cleaned up obsolete: {f}")

    # 3. Swap in files from new strategy
    for target, source in cfg["files"].items():
        os.makedirs(os.path.dirname(target) if os.path.dirname(target) else ".", exist_ok=True)
        shutil.copy2(source, target)
        print(f"[+] Installed: {target}")

    # 4. Merge package.json
    if not merge_package_json(strategy):
        print("[!] Error: Failed to merge package.json.", file=sys.stderr)
        return False

    # 5. Save state in settings file
    write_settings(strategy)

    print(f"[+] Successfully switched to '{strategy}' routing strategy!")
    print("[!] Please run 'npm install' to ensure correct dependencies are loaded.")
    return True

def interactive_prompt(current):
    print("=========================================")
    print("      React of Titan Routing Selector    ")
    print("=========================================")
    print(f"Current strategy: \033[1;32m{current}\033[0m\n")
    print("Select target strategy:")
    opts = list(STRATEGIES.keys())
    for idx, opt in enumerate(opts, 1):
        marker = " (active)" if opt == current else ""
        print(f"  {idx}. {opt}{marker}")
    
    while True:
        try:
            choice = input(f"\nEnter choice [1-{len(opts)}] or Ctrl+C to exit: ").strip()
            if not choice:
                continue
            idx = int(choice) - 1
            if 0 <= idx < len(opts):
                return opts[idx]
        except ValueError:
            pass
        print(f"[!] Invalid selection. Please enter a number 1-{len(opts)}.")

def main():
    parser = argparse.ArgumentParser(description="React of Titan Routing Strategy Selector")
    parser.add_argument(
        "strategy",
        nargs="?",
        choices=list(STRATEGIES.keys()),
        help="Routing strategy to apply (explicit, vite-plugin-pages, framework)"
    )
    parser.add_argument(
        "-f", "--force",
        action="store_true",
        help="Force file swapping even if the strategy is already active"
    )
    args = parser.parse_args()

    prev_strategy = detect_current_strategy()

    if args.strategy:
        target = args.strategy
    else:
        try:
            target = interactive_prompt(prev_strategy)
        except KeyboardInterrupt:
            print("\n[*] Canceled.")
            sys.exit(0)

    success = apply_strategy(target, prev_strategy, force=args.force)
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
