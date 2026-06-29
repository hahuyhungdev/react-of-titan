#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const sourceExtensions = new Set([".ts", ".tsx"]);
const ignoredSourcePatterns = [/\.test\./, /\.spec\./, /\/testing\//];

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!sourceExtensions.has(path.extname(entry.name))) return [];

    const relative = toPosix(path.relative(srcDir, fullPath));
    if (ignoredSourcePatterns.some((pattern) => pattern.test(relative))) return [];
    return [fullPath];
  });
}

function stripKnownExtension(relativePath) {
  return relativePath.replace(/\.(tsx?|jsx?|s?css)$/u, "");
}

function getLayer(relativePath) {
  const [layer, name] = relativePath.split("/");
  if (layer === "shared") return { layer: "shared" };
  if (layer === "features") return { layer: "features", feature: name };
  if (layer === "pages") return { layer: "pages" };
  if (layer === "layouts") return { layer: "layouts" };
  if (layer === "styles") return { layer: "styles" };
  return { layer: "app" };
}

function resolveInternalImport(fromFile, specifier) {
  if (specifier.startsWith("@/")) {
    return stripKnownExtension(specifier.slice(2));
  }

  if (!specifier.startsWith(".")) {
    return null;
  }

  const resolved = path.resolve(path.dirname(fromFile), specifier);
  if (!resolved.startsWith(srcDir)) {
    return null;
  }

  return stripKnownExtension(toPosix(path.relative(srcDir, resolved)));
}

function isFeaturePublicEntry(targetPath) {
  const parts = targetPath.split("/");
  if (parts[0] !== "features" || parts.length < 2) return false;
  return parts.length === 2 || (parts.length === 3 && parts[2] === "index");
}

function getModuleSpecifiers(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );

  const specifiers = [];

  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
}

function getInlineStyleProps(filePath) {
  if (!filePath.endsWith(".tsx")) return [];

  const text = fs.readFileSync(filePath, "utf8");
  const sourceFile = ts.createSourceFile(
    filePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const locations = [];

  function visit(node) {
    if (ts.isJsxAttribute(node) && node.name.text === "style") {
      const position = sourceFile.getLineAndCharacterOfPosition(node.name.getStart(sourceFile));
      locations.push({ line: position.line + 1 });
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return locations;
}

function validateImport(fromRelative, toRelative, specifier) {
  const from = getLayer(fromRelative);
  const to = getLayer(toRelative);

  if (from.layer === "app") return null;

  if (from.layer === "shared") {
    if (to.layer === "shared") return null;
    return "shared code may only import other shared code";
  }

  if (from.layer === "layouts") {
    if (to.layer === "shared") return null;
    return "layouts may only import shared code";
  }

  if (from.layer === "features") {
    if (to.layer === "shared") return null;
    if (to.layer === "features" && from.feature === to.feature) return null;
    return "features may import shared code and same-feature files only";
  }

  if (from.layer === "pages") {
    if (to.layer === "shared" || to.layer === "layouts") return null;
    if (isFeaturePublicEntry(toRelative)) return null;
    if (to.layer === "features") {
      return "pages must import features through their public index";
    }
    return "pages may import shared, layouts, and feature public indexes only";
  }

  return `unsupported import from ${from.layer} to ${to.layer}: ${specifier}`;
}

const files = walk(srcDir);
const violations = [];
const styleViolations = [];

for (const filePath of files) {
  const fromRelative = stripKnownExtension(toPosix(path.relative(srcDir, filePath)));
  for (const specifier of getModuleSpecifiers(filePath)) {
    if (/\.(css|scss)$/u.test(specifier)) continue;

    const toRelative = resolveInternalImport(filePath, specifier);
    if (!toRelative) continue;

    const reason = validateImport(fromRelative, toRelative, specifier);
    if (reason) {
      violations.push({
        file: `${fromRelative}${path.extname(filePath)}`,
        specifier,
        reason,
      });
    }
  }

  for (const location of getInlineStyleProps(filePath)) {
    styleViolations.push({
      file: `${fromRelative}${path.extname(filePath)}`,
      line: location.line,
    });
  }
}

if (violations.length > 0 || styleViolations.length > 0) {
  if (styleViolations.length > 0) {
    console.error("Inline style props found:\n");
    for (const violation of styleViolations) {
      console.error(`- src/${violation.file}:${violation.line} uses a JSX style prop`);
      console.error("  Move styling to Tailwind classes or a styles.module.scss file.");
    }
    console.error("");
  }

  if (violations.length > 0) {
    console.error("Architecture boundary violations found:\n");
    for (const violation of violations) {
      console.error(`- src/${violation.file} imports "${violation.specifier}"`);
      console.error(`  ${violation.reason}`);
    }
  }
  process.exit(1);
}

console.log(`Architecture boundaries OK (${files.length} source files checked).`);
