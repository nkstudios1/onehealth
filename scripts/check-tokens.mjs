// Usage: pnpm check:tokens
// To allow a hex on one line (rare, e.g. the browser theme-color), add:  // token-check: allow
import { readdirSync, readFileSync, statSync } from "node:fs"
import { extname, join, relative } from "node:path"

const ROOTS = ["apps", "packages/ui/src"]
const EXTENSIONS = new Set([".ts", ".tsx", ".css"])
const SKIP_DIRS = new Set(["node_modules", ".next", ".turbo", "dist"])
const ALLOWED_FILES = new Set(["packages/ui/src/styles/globals.css"])
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/

const problems = []

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(full)
      continue
    }
    if (!EXTENSIONS.has(extname(name))) continue
    const rel = relative(process.cwd(), full).replaceAll("\\", "/")
    if (ALLOWED_FILES.has(rel)) continue
    readFileSync(full, "utf8").split("\n").forEach((line, index) => {
      if (HEX.test(line) && !line.includes("token-check: allow")) {
        problems.push(`${rel}:${index + 1}  ${line.trim()}`)
      }
    })
  }
}

for (const root of ROOTS) walk(root)

if (problems.length > 0) {
  console.error("Hard-coded colours found. Use a design token instead (see DESIGN.md):\n")
  console.error(problems.join("\n"))
  process.exit(1)
}
console.log("No hard-coded colours found.")