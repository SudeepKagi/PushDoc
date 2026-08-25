/**
 * Hierarchical Service & Component Detector — service.detector.js (V2)
 *
 * Classifies repositories and monorepo directories into hierarchical component types:
 *
 *   1. "application"     — Frontend client applications (React, Vue, Next.js, Flutter, mobile)
 *   2. "service"         — Independent backend microservices & APIs (Express, Spring, FastAPI, Gin)
 *   3. "library"         — Internal shared utility/data packages (e.g. packages/common, libs/types)
 *   4. "infrastructure"  — Orchestration & deployment configurations (Docker, Kubernetes, Terraform)
 *   5. "generated_code"  — Auto-generated stubs (Proto, OpenAPI client SDKs)
 *
 * DETECTION STRATEGY
 * ──────────────────
 * 1. docker-compose.yml: Identifies explicit service declarations and container topologies.
 * 2. Hierarchical folder patterns: apps/*, services/*, packages/*, libs/*, infra/*, k8s/*.
 * 3. Subdirectory manifest discovery: Detects independent package.json, pom.xml, go.mod, Cargo.toml.
 * 4. Fallback: Single unified application or service.
 */

import * as Fact from "./fact.schema.js";

const MANIFEST_FILENAMES = new Set([
    "package.json", "pom.xml", "build.gradle", "build.gradle.kts",
    "go.mod", "Cargo.toml", "composer.json", "Gemfile", "pyproject.toml",
    "requirements.txt", "Pipfile", "pubspec.yaml", "mix.exs", "Package.swift",
]);

const APP_DIR_PATTERNS = [
    /^apps?\/[^/]+$/i,
    /^(?:frontend|client|web|mobile|admin|dashboard|ui|portal)$/i,
];

const SERVICE_DIR_PATTERNS = [
    /^services?\/[^/]+$/i,
    /^backend\/[^/]+$/i,
    /^api\/[^/]+$/i,
    /^.+[-_](?:service|api|backend|worker|gateway|server)$/i,
];

const LIB_DIR_PATTERNS = [
    /^packages?\/[^/]+$/i,
    /^libs?\/[^/]+$/i,
    /^shared\/[^/]+$/i,
    /^common\/[^/]+$/i,
];

const INFRA_DIR_PATTERNS = [
    /^infra(?:structure)?/i,
    /^k8s|^kubernetes/i,
    /^terraform/i,
    /^deploy(?:ment)?/i,
    /^docker/i,
];

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detects the component topology of a repository.
 *
 * @param {Array<{path, content, extension}>} files
 * @returns {{
 *   isMonorepo: boolean,
 *   services: Fact.service[],
 *   confidence: number,
 *   evidence: string[],
 * }}
 */
export const detectServices = (files) => {
    const byName = buildFileIndex(files);

    // ── Signal 1: docker-compose.yml ─────────────────────────────────────────
    const dockerCompose = byName["docker-compose.yml"] || byName["docker-compose.yaml"];
    if (dockerCompose) {
        const result = parseDockerCompose(dockerCompose.content, files);
        if (result.services.length >= 2) {
            return {
                isMonorepo: true,
                services:   result.services,
                confidence: Fact.SourceReliability.CONFIG,
                evidence:   [`docker-compose.yml defines ${result.services.length} container services`],
            };
        }
    }

    // ── Signal 2: Hierarchical directory structures (apps/*, services/*, packages/*) ─
    const hierarchicalComponents = scanHierarchicalDirectories(files);
    if (hierarchicalComponents.length >= 2) {
        return {
            isMonorepo: true,
            services:   hierarchicalComponents,
            confidence: Fact.SourceReliability.CONFIG,
            evidence:   [`Monorepo layout detected with ${hierarchicalComponents.length} distinct components`],
        };
    }

    // ── Signal 3: Subdirectory manifests (1 level deep) ──────────────────────
    const subManifests = findSubdirectoryManifests(files);
    if (subManifests.length >= 2) {
        const services = subManifests.map(m => {
            const compType = classifyComponentType(m.dir);
            return Fact.service({
                name:          m.dir,
                path:          m.dir,
                componentType: compType,
                ecosystem:     ecosystemFromManifest(m.filename),
                confidence:    0.90,
                evidence:      [`${m.filename} located in ${m.dir}/ classified as ${compType}`],
            });
        });

        return {
            isMonorepo: true,
            services,
            confidence: 0.90,
            evidence:   [`${subManifests.length} subdirectories each contain their own manifest file`],
        };
    }

    // ── Fallback: Single unified project ──────────────────────────────────────
    const rootName = inferProjectName(files);
    const rootEcosystem = detectEcosystemFromFiles(files) || "unknown";
    const compType = isFrontendFiles(files) ? "application" : "service";

    return {
        isMonorepo: false,
        services: [
            Fact.service({
                name:          rootName,
                path:          ".",
                componentType: compType,
                ecosystem:     rootEcosystem,
                confidence:    1.0,
                evidence:      ["Single root project structure"],
            })
        ],
        confidence: 1.0,
        evidence:   ["Single unified application"],
    };
};

/**
 * Returns files belonging to a service directory.
 */
export const getServiceFiles = (svc, allFiles) => {
    if (svc.path === "." || !svc.path) return allFiles;

    const prefix = svc.path.replace(/\\/g, "/").replace(/\/$/, "") + "/";
    return allFiles.filter(f => {
        const normalized = f.path.replace(/\\/g, "/");
        return normalized === svc.path || normalized.startsWith(prefix);
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// Hierarchical Directory Scanner
// ─────────────────────────────────────────────────────────────────────────────

function scanHierarchicalDirectories(files) {
    const components = [];
    const discoveredPaths = new Set();

    for (const file of files) {
        const norm = file.path.replace(/\\/g, "/");
        const parts = norm.split("/");

        // Check 2-level deep directories: apps/web, services/users, packages/common
        if (parts.length >= 2) {
            const topDir = parts[0];
            const subDir = `${parts[0]}/${parts[1]}`;

            if (["apps", "services", "packages", "libs", "modules"].includes(topDir.toLowerCase())) {
                if (!discoveredPaths.has(subDir)) {
                    discoveredPaths.add(subDir);
                    const name = parts[1];
                    const compType = classifyComponentType(subDir);
                    const svcFiles = files.filter(f => f.path.replace(/\\/g, "/").startsWith(subDir + "/"));
                    const ecosystem = detectEcosystemFromFiles(svcFiles) || "unknown";

                    components.push(Fact.service({
                        name,
                        path:          subDir,
                        componentType: compType,
                        ecosystem,
                        confidence:    0.92,
                        evidence:      [`Hierarchical directory ${subDir}/ classified as ${compType}`],
                    }));
                }
            }
        }
    }

    return components;
}

// ─────────────────────────────────────────────────────────────────────────────
// Classification & Parsing Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function classifyComponentType(dirPath, files = []) {
    const norm = dirPath.replace(/\\/g, "/").toLowerCase();

    if (APP_DIR_PATTERNS.some(p => p.test(norm))) return "application";
    if (SERVICE_DIR_PATTERNS.some(p => p.test(norm))) return "service";
    if (LIB_DIR_PATTERNS.some(p => p.test(norm))) return "library";
    if (INFRA_DIR_PATTERNS.some(p => p.test(norm))) return "infrastructure";
    if (norm.includes("proto") || norm.includes("gen-") || norm.includes("generated")) return "generated_code";

    if (files.length > 0) {
        if (isFrontendFiles(files)) return "application";
        const hasManifest = files.some(f => MANIFEST_FILENAMES.has(f.path.split(/[/\\]/).pop()));
        if (hasManifest) return "service";
    }

    // Default fallback: return unknown when signals are ambiguous
    return "unknown";
}

function parseDockerCompose(content, allFiles) {
    const services = [];
    const servicesBlockMatch = content.match(/^services:\s*$([\s\S]*?)(?=^\S|\s*$)/m);
    if (!servicesBlockMatch) return { services };

    const block = servicesBlockMatch[1];
    const serviceRegex = /^  ([\w-]+):\s*$/gm;
    let m;

    while ((m = serviceRegex.exec(block)) !== null) {
        const name = m[1];
        const afterService = block.slice(m.index + m[0].length);
        const buildMatch   = afterService.match(/^\s{4}build:\s*\.?\/?(\S*)/m);
        const servicePath  = buildMatch ? (buildMatch[1] || name) : name;

        const serviceFiles = allFiles.filter(f =>
            f.path.replace(/\\/g, "/").startsWith(servicePath + "/") ||
            f.path.replace(/\\/g, "/").startsWith("./" + servicePath + "/")
        );

        const ecosystem = detectEcosystemFromFiles(serviceFiles) || "unknown";
        const compType  = classifyComponentType(servicePath);

        services.push(Fact.service({
            name,
            path:          servicePath || name,
            componentType: compType,
            ecosystem,
            confidence:    Fact.SourceReliability.CONFIG,
            evidence:      [`docker-compose.yml: services.${name}`],
        }));
    }

    return { services };
}

function findSubdirectoryManifests(files) {
    const found = [];
    for (const file of files) {
        const normalized = file.path.replace(/\\/g, "/");
        const parts      = normalized.split("/");
        if (parts.length === 2 && MANIFEST_FILENAMES.has(parts[1])) {
            found.push({ dir: parts[0], filename: parts[1] });
        }
    }
    return found;
}

function buildFileIndex(files) {
    const idx = {};
    for (const f of files) {
        const name = f.path.replace(/\\/g, "/").split("/").pop().toLowerCase();
        if (!idx[name]) idx[name] = f;
    }
    return idx;
}

function ecosystemFromManifest(filename) {
    const map = {
        "package.json": "nodejs",       "pom.xml": "java",
        "build.gradle": "java",         "build.gradle.kts": "java",
        "go.mod": "go",                 "Cargo.toml": "rust",
        "composer.json": "php",         "Gemfile": "ruby",
        "pyproject.toml": "python",     "requirements.txt": "python",
        "Pipfile": "python",            "pubspec.yaml": "dart",
        "mix.exs": "elixir",            "Package.swift": "swift",
    };
    return map[filename] || "unknown";
}

function detectEcosystemFromFiles(files) {
    const names = new Set(files.map(f => f.path.split(/[/\\]/).pop()));
    if (names.has("package.json"))    return "nodejs";
    if (names.has("pom.xml") || names.has("build.gradle") || names.has("build.gradle.kts")) return "java";
    if (names.has("go.mod"))          return "go";
    if (names.has("Cargo.toml"))      return "rust";
    if (names.has("composer.json"))   return "php";
    if (names.has("Gemfile"))         return "ruby";
    if (names.has("requirements.txt") || names.has("pyproject.toml")) return "python";
    if (names.has("pubspec.yaml"))    return "dart";
    if (names.has("mix.exs"))         return "elixir";
    return null;
}

function isFrontendFiles(files) {
    return files.some(f => {
        const ext = (f.extension || "").toLowerCase();
        return [".jsx", ".tsx", ".vue", ".svelte"].includes(ext) ||
               f.path.toLowerCase().includes("src/components");
    });
}

function inferProjectName(files) {
    const pkgFile = files.find(f => f.path.replace(/\\/g, "/") === "package.json");
    if (pkgFile) {
        try { return JSON.parse(pkgFile.content).name || "project"; } catch {}
    }
    return "project";
}
