/**
 * Manifest Parsers — manifest.parsers.js
 *
 * Dedicated, robust parsers for various ecosystem manifest and build specification files.
 */

/**
 * Parses Python requirements.txt file.
 */
export function parseRequirementsTxt(content) {
    if (!content) return [];
    return content.split("\n")
        .map(line => line.trim())
        .filter(line => line && !line.startsWith("#") && !line.startsWith("-"))
        .map(line => line.split(/[=><!~^]/)[0].trim().toLowerCase())
        .filter(Boolean);
}

/**
 * Parses Python pyproject.toml file (Poetry, Hatch, PDM).
 */
export function parsePyprojectToml(content) {
    if (!content) return { name: "", version: "", description: "", deps: [] };

    const name    = (content.match(/^name\s*=\s*"([^"]+)"/m)    || [])[1] || "";
    const version = (content.match(/^version\s*=\s*"([^"]+)"/m) || [])[1] || "";
    const desc    = (content.match(/^description\s*=\s*"([^"]+)"/m) || [])[1] || "";

    const depMatches = content.match(/^\s*([\w-]+)\s*=\s*["^~{]/mg) || [];
    const deps = depMatches
        .map(m => m.trim().split(/\s*=/)[0].trim().toLowerCase())
        .filter(d => d && d !== "python" && d !== "name" && d !== "version");

    return { name, version, description: desc, deps };
}

/**
 * Parses Python Pipfile.
 */
export function parsePipfile(content) {
    if (!content) return [];
    const deps = [];
    const matches = content.matchAll(/^([\w-]+)\s*=/gm);
    for (const m of matches) {
        const name = m[1].toLowerCase();
        if (name !== "python_version" && name !== "python_full_version") {
            deps.push(name);
        }
    }
    return deps;
}

/**
 * Parses Java Maven pom.xml.
 */
export function parsePomXml(content) {
    if (!content) return { artifactId: "", version: "", deps: [] };

    const artifactId = (content.match(/<artifactId>(.*?)<\/artifactId>/)?.[1] || "").trim();
    const version    = (content.match(/<version>(.*?)<\/version>/)?.[1]    || "").trim();

    const deps = [];
    const depRegex = /<dependency>[\s\S]*?<artifactId>(.*?)<\/artifactId>[\s\S]*?<\/dependency>/g;
    let m;
    while ((m = depRegex.exec(content)) !== null) {
        deps.push(m[1].trim());
    }

    return { artifactId, version, deps };
}

/**
 * Parses Java/Kotlin build.gradle / build.gradle.kts.
 */
export function parseGradle(content) {
    if (!content) return { deps: [] };
    const deps = [];
    const matches = content.matchAll(/(?:implementation|api|runtimeOnly|compileOnly)\s*[('"]([^'"]+)['"]/g);
    for (const m of matches) {
        const parts = m[1].split(":");
        if (parts.length >= 2) deps.push(parts[1]);
    }
    return { deps };
}

/**
 * Parses Go go.mod.
 */
export function parseGoMod(content) {
    if (!content) return { moduleName: "", goVersion: "", deps: [] };

    const moduleMatch = content.match(/^module\s+(\S+)/m);
    const goMatch     = content.match(/^go\s+([\d.]+)/m);

    const deps = [];
    const reqBlock = content.match(/require\s*\(([\s\S]*?)\)/);
    const source   = reqBlock ? reqBlock[1] : content;
    const depMatches = source.matchAll(/^\s+([\w./\-@]+)\s+v/mg);
    for (const m of depMatches) deps.push(m[1]);

    const singleMatches = content.matchAll(/^require\s+([\w./\-@]+)\s+v/mg);
    for (const m of singleMatches) deps.push(m[1]);

    return {
        moduleName: moduleMatch?.[1] || "",
        goVersion:  goMatch?.[1]     || "",
        deps:       [...new Set(deps)],
    };
}

/**
 * Parses Rust Cargo.toml.
 */
export function parseCargoToml(content) {
    if (!content) return { name: "", version: "", description: "", deps: [] };

    const name    = (content.match(/^\s*name\s*=\s*"([^"]+)"/m)    || [])[1] || "";
    const version = (content.match(/^\s*version\s*=\s*"([^"]+)"/m) || [])[1] || "";
    const desc    = (content.match(/^\s*description\s*=\s*"([^"]+)"/m) || [])[1] || "";

    const deps = [];
    const matches = content.matchAll(/^([\w-]+)\s*=\s*(?:"[^"]*"|\{)/mg);
    for (const m of matches) {
        const dName = m[1];
        if (!["name","version","edition","description","authors","license"].includes(dName)) {
            deps.push(dName);
        }
    }

    return { name, version, description: desc, deps };
}

/**
 * Parses Ruby Gemfile.
 */
export function parseGemfile(content) {
    if (!content) return [];
    const deps = [];
    const matches = content.matchAll(/^\s*gem\s+['"]([^'"]+)['"]/mg);
    for (const m of matches) deps.push(m[1].toLowerCase());
    return deps;
}

/**
 * Parses .NET .csproj file.
 */
export function parseCsproj(content) {
    if (!content) return [];
    const deps = [];
    const matches = content.matchAll(/<PackageReference\s+Include="([^"]+)"/g);
    for (const m of matches) deps.push(m[1]);
    return deps;
}

/**
 * Parses Dart pubspec.yaml file.
 */
export function parsePubspec(content) {
    if (!content) return { name: "", version: "", deps: [] };

    const name    = (content.match(/^name:\s*(\S+)/m)    || [])[1] || "";
    const version = (content.match(/^version:\s*(\S+)/m) || [])[1] || "";

    const deps = [];
    const matches = content.matchAll(/^\s{2}([\w_]+):/gm);
    for (const m of matches) {
        const dep = m[1];
        if (!["flutter","dart","sdk","platforms"].includes(dep)) deps.push(dep);
    }

    return { name, version, deps: [...new Set(deps)] };
}

/**
 * Parses Elixir mix.exs file.
 */
export function parseMixExs(content) {
    if (!content) return [];
    const deps = [];
    const matches = content.matchAll(/\{:([\w_]+),/g);
    for (const m of matches) deps.push(m[1]);
    return [...new Set(deps)];
}
