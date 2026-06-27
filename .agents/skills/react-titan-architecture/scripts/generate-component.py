#!/usr/bin/env python3
import os
import sys

def generate_component(comp_name, target_dir, add_scss=False):
    # Normalize name to PascalCase
    pascal = comp_name[0].upper() + comp_name[1:]
    
    target_abs = os.path.abspath(os.path.join(os.getcwd(), target_dir, pascal))
    
    if os.path.exists(target_abs):
        print(f"[!] Error: Component directory '{pascal}' already exists at {target_abs}", file=sys.stderr)
        sys.exit(1)
        
    print(f"[*] Generating component '{pascal}' inside {target_dir}...")
    os.makedirs(target_abs, exist_ok=True)
    
    # 1. SCSS file
    scss_import = ""
    if add_scss:
        scss_file = os.path.join(target_abs, f"{pascal}.module.scss")
        with open(scss_file, "w", encoding="utf-8") as f:
            f.write(f".container {{\n  display: block;\n}}\n")
        scss_import = f"import styles from \"./{pascal}.module.scss\";\n\n"
        print(f"[+] Created: {pascal}.module.scss")
        
    # 2. TSX file
    tsx_file = os.path.join(target_abs, f"{pascal}.tsx")
    with open(tsx_file, "w", encoding="utf-8") as f:
        class_name = f"styles.container" if add_scss else f"\"{pascal.lower()}-component\""
        f.write(f"""{scss_import}interface {pascal}Props {{
  children?: React.ReactNode;
}}

export function {pascal}({{ children }}: {pascal}Props) {{
  return (
    <div className={ {class_name} }>
      {{children}}
    </div>
  );
}}

export default {pascal};
""")
    print(f"[+] Created: {pascal}.tsx")
    print(f"[+] Successfully generated component folder at: {target_dir}/{pascal}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 generate-component.py <ComponentName> <TargetDirectory> [--scss]")
        sys.exit(1)
        
    comp = sys.argv[1]
    target = sys.argv[2]
    scss = "--scss" in sys.argv
    generate_component(comp, target, scss)
