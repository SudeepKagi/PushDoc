/**
 * Package / Manifest Analyzer — package.analyzer.js (Production Modular V5)
 *
 * Detects the repository's primary ecosystem and manifest file, extracts dependencies,
 * and classifies frameworks, databases, auth providers, and runtimes into a normalized profile.
 */

import {
    JS_FRAMEWORKS, JS_DATABASES, JS_AUTH, JS_STORAGE, JS_UTILITY,
    PYTHON_FRAMEWORKS, PYTHON_DATABASES, PYTHON_AUTH,
    JAVA_FRAMEWORKS, JAVA_DATABASES,
    GO_FRAMEWORKS, GO_DATABASES,
    RUST_FRAMEWORKS, RUST_DATABASES,
    PHP_FRAMEWORKS, PHP_DATABASES,
    RUBY_FRAMEWORKS, RUBY_DATABASES,
    DOTNET_FRAMEWORKS, DOTNET_DATABASES,
    DART_FRAMEWORKS,
    ELIXIR_FRAMEWORKS, ELIXIR_DATABASES,
    UNKNOWN_HEURISTICS, LOCKFILE_MAP, EXTENSION_LANGUAGE_MAP, IGNORED_DIRS,
} from "./manifests/ecosystems.catalog.js";

import {
    parseRequirementsTxt,
    parsePyprojectToml,
    parsePipfile,
    parsePomXml,
    parseGradle,
    parseGoMod,
    parseCargoToml,
    parseGemfile,
    parseCsproj,
    parsePubspec,
    parseMixExs,
} from "./manifests/manifest.parsers.js";

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Detects which manifest file exists in the repository, reads it, and returns
 * a normalized technology profile.
 *
 * @param {object} repository - { files: Array<{ path, content, extension }> }
 * @returns {object} Normalized technology manifest object
 */
export const analyzePackage = (repository) => {
    const files = repository?.files || [];
    const byName = buildFileIndex(files);
    const ecosystem = detectEcosystem(byName, files);

    switch (ecosystem) {
        case "python":  return analyzePython(byName, files, ecosystem);
        case "java":    return analyzeJava(byName, files, ecosystem);
        case "go":      return analyzeGo(byName, files, ecosystem);
        case "rust":    return analyzeRust(byName, files, ecosystem);
        case "php":     return analyzePhp(byName, files, ecosystem);
        case "ruby":    return analyzeRuby(byName, files, ecosystem);
        case "dotnet":  return analyzeDotnet(byName, files, ecosystem);
        case "dart":    return analyzeDart(byName, files, ecosystem);
        case "elixir":  return analyzeElixir(byName, files, ecosystem);
        case "nodejs":
        default:        return analyzeNodejs(byName, files, ecosystem);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Ecosystem Detection & File Indexing
// ─────────────────────────────────────────────────────────────────────────────

function buildFileIndex(files) {
    const idx = {};
    for (const f of files) {
        const name = f.path.replace(/\\/g, "/").split("/").pop();
        if (!idx[name]) idx[name] = f;
    }
    return idx;
}

function detectEcosystem(byName, files) {
    if (byName["requirements.txt"] || byName["pyproject.toml"] || byName["Pipfile"]) return "python";
    if (byName["pom.xml"] || byName["build.gradle"] || byName["build.gradle.kts"]) return "java";
    if (byName["go.mod"])         return "go";
    if (byName["Cargo.toml"])     return "rust";
    if (byName["composer.json"])  return "php";
    if (byName["Gemfile"])        return "ruby";
    if (byName["pubspec.yaml"])   return "dart";
    if (byName["mix.exs"])        return "elixir";
    if (byName["Package.swift"])  return "swift";

    if (files.some(f => f.path.endsWith(".csproj") || f.path.endsWith(".sln"))) return "dotnet";
    if (byName["package.json"])   return "nodejs";

    return "unknown";
}

function buildResult(ecosystem, project, technology, deps, scripts = {}) {
    return {
        ecosystem,
        project,
        technology: {
            ...technology,
            language:  technology.language || detectLanguageFromFiles(deps._files || []),
            framework: (technology.frameworks || [])[0] || "Unknown",
        },
        runtimeDependencies: deps.runtime || [],
        devDependencies:     deps.dev     || [],
        dependencies:        deps.all     || [],
        scripts,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ecosystem Handlers
// ─────────────────────────────────────────────────────────────────────────────

function analyzeNodejs(byName, files, ecosystem) {
    const pkgFile = byName["package.json"];
    if (!pkgFile) return buildUnknownResult(ecosystem, files);

    let pkg;
    try { pkg = JSON.parse(pkgFile.content); }
    catch { return null; }

    const runtimeDeps = pkg.dependencies    || {};
    const devDeps     = pkg.devDependencies || {};
    const allDeps     = { ...runtimeDeps, ...devDeps };

    const classified = classifyNodeDeps(allDeps);
    const pm = detectPackageManager(byName);

    return buildResult(ecosystem, {
        name:        pkg.name        || "",
        version:     pkg.version     || "",
        description: pkg.description || "",
        keywords:    pkg.keywords    || [],
    }, {
        language:       detectLanguageFromFiles(files),
        frameworks:     classified.frameworks,
        database:       classified.databases,
        authentication: classified.authentication,
        storage:        classified.storage,
        packageManager: pm,
        runtime:        detectNodeRuntime(pkg, allDeps),
        unknownTech:    classified.unknownByCategory,
        unrecognized:   classified.unrecognized,
    }, {
        runtime: Object.keys(runtimeDeps),
        dev:     Object.keys(devDeps),
        all:     Object.keys(allDeps),
    }, pkg.scripts || {});
}

function analyzePython(byName, files, ecosystem) {
    let allDeps = [];
    let projectName = "", projectVersion = "", projectDescription = "";

    if (byName["requirements.txt"]) {
        allDeps = parseRequirementsTxt(byName["requirements.txt"].content);
    }
    if (byName["pyproject.toml"]) {
        const parsed = parsePyprojectToml(byName["pyproject.toml"].content);
        projectName        = parsed.name        || projectName;
        projectVersion     = parsed.version     || projectVersion;
        projectDescription = parsed.description || projectDescription;
        allDeps = [...new Set([...allDeps, ...parsed.deps])];
    }
    if (byName["Pipfile"]) {
        allDeps = [...new Set([...allDeps, ...parsePipfile(byName["Pipfile"].content)])];
    }

    const classified = classifyGenericDeps(allDeps, PYTHON_FRAMEWORKS, PYTHON_DATABASES, PYTHON_AUTH, {});

    return buildResult(ecosystem, {
        name:        projectName,
        version:     projectVersion,
        description: projectDescription,
        keywords:    [],
    }, {
        language:       "Python",
        frameworks:     classified.frameworks,
        database:       classified.databases,
        authentication: classified.authentication,
        storage:        classified.storage,
        packageManager: byName["Pipfile.lock"] ? "Pipenv" : byName["poetry.lock"] ? "Poetry" : "pip",
        runtime:        detectPythonRuntime(byName),
        unknownTech:    classified.unknownByCategory,
        unrecognized:   classified.unrecognized,
    }, {
        runtime: allDeps,
        dev:     [],
        all:     allDeps,
    });
}

function analyzeJava(byName, files, ecosystem) {
    let allDeps = [];
    let projectName = "", projectVersion = "", projectDescription = "";
    let buildTool = "Maven";

    if (byName["pom.xml"]) {
        const parsed = parsePomXml(byName["pom.xml"].content);
        projectName    = parsed.name || parsed.artifactId || "";
        projectVersion = parsed.version || "";
        allDeps        = parsed.deps;
        buildTool      = "Maven";
    }

    if (byName["build.gradle"] || byName["build.gradle.kts"]) {
        const f = byName["build.gradle"] || byName["build.gradle.kts"];
        const parsed = parseGradle(f.content);
        allDeps   = [...new Set([...allDeps, ...parsed.deps])];
        buildTool = "Gradle";
    }

    const classified = classifyGenericDeps(allDeps, JAVA_FRAMEWORKS, JAVA_DATABASES, {}, {});
    const isKotlin   = files.some(f => f.path.endsWith(".kt") || f.path.endsWith(".kts"));

    return buildResult(ecosystem, {
        name: projectName, version: projectVersion,
        description: projectDescription, keywords: [],
    }, {
        language:       isKotlin ? "Kotlin" : "Java",
        frameworks:     classified.frameworks,
        database:       classified.databases,
        authentication: classified.authentication,
        storage:        classified.storage,
        packageManager: buildTool,
        runtime:        "JVM",
        unknownTech:    classified.unknownByCategory,
        unrecognized:   classified.unrecognized,
    }, { runtime: allDeps, dev: [], all: allDeps });
}

function analyzeGo(byName, files, ecosystem) {
    const goMod = byName["go.mod"];
    const parsed = goMod ? parseGoMod(goMod.content) : { moduleName: "", goVersion: "", deps: [] };
    const classified = classifyGenericDeps(parsed.deps, GO_FRAMEWORKS, GO_DATABASES, {}, {});

    return buildResult(ecosystem, {
        name:        parsed.moduleName,
        version:     parsed.goVersion,
        description: "",
        keywords:    [],
    }, {
        language:       "Go",
        frameworks:     classified.frameworks,
        database:       classified.databases,
        authentication: classified.authentication,
        storage:        classified.storage,
        packageManager: "Go Modules",
        runtime:        "Go Runtime",
        unknownTech:    classified.unknownByCategory,
        unrecognized:   classified.unrecognized,
    }, { runtime: parsed.deps, dev: [], all: parsed.deps });
}

function analyzeRust(byName, files, ecosystem) {
    const cargo = byName["Cargo.toml"];
    const parsed = cargo ? parseCargoToml(cargo.content) : { name: "", version: "", deps: [] };
    const classified = classifyGenericDeps(parsed.deps, RUST_FRAMEWORKS, RUST_DATABASES, {}, {});

    return buildResult(ecosystem, {
        name: parsed.name, version: parsed.version, description: parsed.description || "", keywords: [],
    }, {
        language: "Rust", frameworks: classified.frameworks, database: classified.databases,
        authentication: classified.authentication, storage: classified.storage,
        packageManager: "Cargo", runtime: "Rust Runtime",
        unknownTech: classified.unknownByCategory, unrecognized: classified.unrecognized,
    }, { runtime: parsed.deps, dev: [], all: parsed.deps });
}

function analyzePhp(byName, files, ecosystem) {
    const composerFile = byName["composer.json"];
    let parsed = { name: "", version: "", deps: [], devDeps: [] };
    if (composerFile) {
        try {
            const c = JSON.parse(composerFile.content);
            parsed.name    = c.name    || "";
            parsed.version = c.version || "";
            parsed.deps    = Object.keys(c.require || {}).filter(d => d !== "php");
            parsed.devDeps = Object.keys(c["require-dev"] || {});
        } catch {}
    }

    const allDeps    = [...parsed.deps, ...parsed.devDeps];
    const classified = classifyGenericDeps(allDeps, PHP_FRAMEWORKS, PHP_DATABASES, {}, {});

    return buildResult(ecosystem, {
        name: parsed.name, version: parsed.version, description: "", keywords: [],
    }, {
        language: "PHP", frameworks: classified.frameworks, database: classified.databases,
        authentication: classified.authentication, storage: classified.storage,
        packageManager: "Composer", runtime: "PHP Runtime",
        unknownTech: classified.unknownByCategory, unrecognized: classified.unrecognized,
    }, { runtime: parsed.deps, dev: parsed.devDeps, all: allDeps });
}

function analyzeRuby(byName, files, ecosystem) {
    const gemfile = byName["Gemfile"];
    const deps = gemfile ? parseGemfile(gemfile.content) : [];
    const classified = classifyGenericDeps(deps, RUBY_FRAMEWORKS, RUBY_DATABASES, {}, {});
    const rubyVersion = byName[".ruby-version"]?.content?.trim() || "";

    return buildResult(ecosystem, {
        name: "", version: rubyVersion, description: "", keywords: [],
    }, {
        language: "Ruby", frameworks: classified.frameworks, database: classified.databases,
        authentication: classified.authentication, storage: classified.storage,
        packageManager: "Bundler", runtime: "Ruby Runtime",
        unknownTech: classified.unknownByCategory, unrecognized: classified.unrecognized,
    }, { runtime: deps, dev: [], all: deps });
}

function analyzeDotnet(byName, files, ecosystem) {
    const csprojFile = files.find(f => f.path.endsWith(".csproj"));
    const deps = csprojFile ? parseCsproj(csprojFile.content) : [];
    const classified = classifyGenericDeps(deps, DOTNET_FRAMEWORKS, DOTNET_DATABASES, {}, {});
    const isFs = files.some(f => f.path.endsWith(".fs"));

    return buildResult(ecosystem, {
        name: "", version: "", description: "", keywords: [],
    }, {
        language: isFs ? "F#" : "C#", frameworks: classified.frameworks, database: classified.databases,
        authentication: classified.authentication, storage: classified.storage,
        packageManager: "NuGet / dotnet CLI", runtime: ".NET Runtime",
        unknownTech: classified.unknownByCategory, unrecognized: classified.unrecognized,
    }, { runtime: deps, dev: [], all: deps });
}

function analyzeDart(byName, files, ecosystem) {
    const pubspec = byName["pubspec.yaml"];
    const parsed  = pubspec ? parsePubspec(pubspec.content) : { name: "", version: "", deps: [] };
    const classified = classifyGenericDeps(parsed.deps, DART_FRAMEWORKS, {}, {}, {});

    return buildResult(ecosystem, {
        name: parsed.name, version: parsed.version, description: "", keywords: [],
    }, {
        language: "Dart", frameworks: classified.frameworks, database: classified.databases,
        authentication: classified.authentication, storage: classified.storage,
        packageManager: "pub", runtime: "Dart / Flutter Runtime",
        unknownTech: classified.unknownByCategory, unrecognized: classified.unrecognized,
    }, { runtime: parsed.deps, dev: [], all: parsed.deps });
}

function analyzeElixir(byName, files, ecosystem) {
    const mixFile = byName["mix.exs"];
    const deps = mixFile ? parseMixExs(mixFile.content) : [];
    const classified = classifyGenericDeps(deps, ELIXIR_FRAMEWORKS, ELIXIR_DATABASES, {}, {});

    return buildResult(ecosystem, {
        name: "", version: "", description: "", keywords: [],
    }, {
        language: "Elixir", frameworks: classified.frameworks, database: classified.databases,
        authentication: classified.authentication, storage: classified.storage,
        packageManager: "Mix / Hex", runtime: "BEAM / OTP",
        unknownTech: classified.unknownByCategory, unrecognized: classified.unrecognized,
    }, { runtime: deps, dev: [], all: deps });
}

function buildUnknownResult(ecosystem, files) {
    return buildResult(ecosystem || "unknown", {
        name: "", version: "", description: "", keywords: [],
    }, {
        language:       detectLanguageFromFiles(files),
        frameworks:     [],
        database:       [],
        authentication: [],
        storage:        [],
        packageManager: "unknown",
        runtime:        "unknown",
        unknownTech:    {},
        unrecognized:   [],
    }, { runtime: [], dev: [], all: [] });
}

// ─────────────────────────────────────────────────────────────────────────────
// Dependency Classifiers & Utilities
// ─────────────────────────────────────────────────────────────────────────────

function classifyGenericDeps(depNames, frameworkMap, dbMap, authMap, storageMap) {
    const frameworks     = [];
    const databases      = [];
    const authentication = [];
    const storage        = [];
    const unknownByCategory = { framework: [], database: [], authentication: [], storage: [] };
    const unrecognized   = [];
    const seen = { fw: new Set(), db: new Set(), auth: new Set(), st: new Set() };

    for (const dep of depNames) {
        if (frameworkMap[dep] && !seen.fw.has(frameworkMap[dep])) {
            frameworks.push(frameworkMap[dep]); seen.fw.add(frameworkMap[dep]); continue;
        }
        if (dbMap[dep] && !seen.db.has(dbMap[dep])) {
            databases.push(dbMap[dep]); seen.db.add(dbMap[dep]); continue;
        }
        if (authMap[dep] && !seen.auth.has(authMap[dep])) {
            authentication.push(authMap[dep]); seen.auth.add(authMap[dep]); continue;
        }
        if (storageMap[dep] && !seen.st.has(storageMap[dep])) {
            storage.push(storageMap[dep]); seen.st.add(storageMap[dep]); continue;
        }

        let matched = false;
        for (const { pattern, category } of UNKNOWN_HEURISTICS) {
            if (pattern.test(dep)) {
                unknownByCategory[category].push(dep);
                matched = true;
                break;
            }
        }
        if (!matched) unrecognized.push({ name: dep });
    }

    return { frameworks, databases, authentication, storage, unknownByCategory, unrecognized };
}

function classifyNodeDeps(allDepsObj) {
    const result = classifyGenericDeps(
        Object.keys(allDepsObj).filter(d => !JS_UTILITY.has(d) && !d.startsWith("@types/")),
        JS_FRAMEWORKS, JS_DATABASES, JS_AUTH, JS_STORAGE
    );
    result.unrecognized = result.unrecognized.map(u => ({
        name: u.name, version: allDepsObj[u.name],
    }));
    return result;
}

function detectPackageManager(byName) {
    for (const [lockfile, manager] of Object.entries(LOCKFILE_MAP)) {
        if (byName[lockfile]) return manager;
    }
    return "npm";
}

function detectLanguageFromFiles(files) {
    const counts = {};
    for (const file of files) {
        const parts = file.path.replace(/\\/g, "/").split("/");
        if (parts.some(p => IGNORED_DIRS.has(p))) continue;
        const ext = ("." + file.path.split(".").pop()).toLowerCase();
        const lang = EXTENSION_LANGUAGE_MAP[ext];
        if (!lang) continue;
        counts[lang] = (counts[lang] || 0) + 1;
    }
    if (!Object.keys(counts).length) return "Unknown";
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function detectNodeRuntime(pkg, deps) {
    if (pkg.engines?.bun)  return "Bun";
    if (pkg.engines?.deno) return "Deno";
    if (deps.bun)          return "Bun";
    return "Node.js";
}

function detectPythonRuntime(byName) {
    const versionFile = byName[".python-version"];
    if (versionFile) return `Python ${versionFile.content.trim()}`;
    return "Python";
}