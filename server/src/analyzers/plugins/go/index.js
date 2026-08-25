/**
 * Go Plugin — plugins/go/index.js
 *
 * Text-pattern extraction for Go web frameworks.
 *
 * SUPPORTED FRAMEWORKS
 * ────────────────────
 *   Gin      r.GET("/path", handler)   r.POST("/path", handler)
 *   Echo     e.GET("/path", handler)   e.POST("/path", handler)
 *   Fiber    app.Get("/path", handler) app.Post("/path", handler)
 *   Chi      r.Get("/path", handler)   r.Post("/path", handler)
 *   Gorilla  r.HandleFunc("/path", handler).Methods("GET")
 *   net/http http.HandleFunc("/path", handler)  (no method)
 *
 * DATABASE DETECTION (via import paths)
 * ──────────────────────────────────────
 *   gorm.io/gorm
 *   go.mongodb.org/mongo-driver
 *   github.com/go-redis/redis
 *   github.com/lib/pq             (PostgreSQL)
 *   github.com/go-sql-driver/mysql
 *   entgo.io/ent
 *
 * ENV VAR DETECTION
 * ─────────────────
 *   os.Getenv("KEY")
 *   os.LookupEnv("KEY")
 *   viper.GetString("KEY")   (popular config library)
 *
 * CONFIDENCE: "medium" — regex on source, not Go's AST package
 */

import { AnalyzerPlugin } from "../../core/analyzer.interface.js";
import * as Fact           from "../../core/fact.schema.js";

const GO_EXTENSIONS = new Set([".go"]);

// Router variable name patterns (user may name their router anything)
// We try to detect the variable name from initialization: r := gin.Default()
// Then match r.GET(...) etc.
const FRAMEWORK_INIT_PATTERNS = [
    { regex: /(\w+)\s*:?=\s*gin\.\w+\(\)/,          type: "gin"     },
    { regex: /(\w+)\s*:?=\s*echo\.New\(\)/,          type: "echo"    },
    { regex: /(\w+)\s*:?=\s*fiber\.New\(\)/,         type: "fiber"   },
    { regex: /(\w+)\s*:?=\s*chi\.NewRouter\(\)/,     type: "chi"     },
    { regex: /(\w+)\s*:?=\s*mux\.NewRouter\(\)/,     type: "gorilla" },
    { regex: /(\w+)\s*:?=\s*huma\.NewRouter\(\)/,    type: "huma"    },
    { regex: /(\w+)\s*=\s*http\.NewServeMux\(\)/,    type: "stdlib"  },
];

// Method patterns per framework type
const ROUTE_EXTRACTORS = {
    gin:     (varName) => new RegExp(`${varName}\\.(GET|POST|PUT|PATCH|DELETE)\\s*\\(\\s*[""]([^""]+)[""]`, "g"),
    echo:    (varName) => new RegExp(`${varName}\\.(GET|POST|PUT|PATCH|DELETE)\\s*\\(\\s*[""]([^""]+)[""]`, "g"),
    fiber:   (varName) => new RegExp(`${varName}\\.(Get|Post|Put|Patch|Delete)\\s*\\(\\s*[""]([^""]+)[""]`, "gi"),
    chi:     (varName) => new RegExp(`${varName}\\.(Get|Post|Put|Patch|Delete)\\s*\\(\\s*[""]([^""]+)[""]`, "gi"),
    gorilla: (varName) => new RegExp(`${varName}\\.HandleFunc\\s*\\(\\s*[""]([^""]+)[""][^)]*\\.Methods\\([""]([^""]+)[""]`, "g"),
    stdlib:  (varName) => new RegExp(`(?:${varName}\\.Handle(?:Func)?|http\\.HandleFunc)\\s*\\(\\s*[""]([^""]+)[""]`, "g"),
};

// Database import patterns
const DB_IMPORT_PATTERNS = [
    { pattern: /[""]gorm\.io\/gorm[""]|[""]gorm\.io\/driver\/postgres[""]/, tech: "GORM" },
    { pattern: /[""]gorm\.io\/driver\/mysql[""]/,                           tech: "MySQL (GORM)" },
    { pattern: /[""]gorm\.io\/driver\/sqlite[""]/,                          tech: "SQLite (GORM)" },
    { pattern: /[""]go\.mongodb\.org\/mongo-driver[""]|[""]mongo-driver[""]/, tech: "MongoDB" },
    { pattern: /[""]github\.com\/(?:go-redis|redis)\/redis[""]|[""]github\.com\/redis\/go-redis[""]/, tech: "Redis" },
    { pattern: /[""]github\.com\/lib\/pq[""]/,                              tech: "PostgreSQL (lib/pq)" },
    { pattern: /[""]github\.com\/go-sql-driver\/mysql[""]/,                 tech: "MySQL" },
    { pattern: /[""]github\.com\/mattn\/go-sqlite3[""]/,                    tech: "SQLite" },
    { pattern: /[""]entgo\.io\/ent[""]/,                                    tech: "Ent ORM" },
    { pattern: /[""]github\.com\/jmoiern\/sqlx[""]|[""]github\.com\/jmoiron\/sqlx[""]/, tech: "sqlx" },
];

export class GoPlugin extends AnalyzerPlugin {

    name()       { return "Go (pattern extraction)"; }
    confidence() { return "medium"; }

    getCapabilities() {
        return {
            languages: ["go"],
            frameworks: ["gin", "echo", "fiber", "chi", "mux", "net/http"],
            produces: ["endpoint", "datastore", "envvar", "servicecall", "event"],
        };
    }

    detect(serviceFiles, manifestInfo) {
        if (manifestInfo?.ecosystem === "go") return true;
        return serviceFiles.some(f => GO_EXTENSIONS.has((f.extension || "").toLowerCase()));
    }

    analyze(serviceFiles, manifestInfo, serviceName) {
        const facts       = [];
        const parseErrors = [];
        const svc         = serviceName || null;
        const seenDb      = new Set();

        const goFiles = serviceFiles.filter(f =>
            GO_EXTENSIONS.has((f.extension || "").toLowerCase())
        );

        for (const file of goFiles) {
            const content = file.content || "";

            // ── Detect router variable names and framework ─────────────────────
            const detectedRouters = [];
            for (const { regex, type } of FRAMEWORK_INIT_PATTERNS) {
                const m = content.match(regex);
                if (m) {
                    detectedRouters.push({ varName: m[1], type });
                }
            }

            // ── Extract routes for each detected router ────────────────────────
            for (const { varName, type } of detectedRouters) {
                const buildRegex = ROUTE_EXTRACTORS[type];
                if (!buildRegex) continue;

                const regex = buildRegex(varName);
                let m;

                if (type === "gorilla") {
                    // Gorilla: HandleFunc("/path", h).Methods("GET", "POST")
                    while ((m = regex.exec(content)) !== null) {
                        const path    = m[1];
                        const methods = m[2].split(/[\s,]+/).filter(Boolean);
                        for (const method of methods) {
                            facts.push(Fact.endpoint({
                                method:     method.toUpperCase(),
                                path,
                                service:    svc,
                                file:       file.path,
                                confidence: Fact.Confidence.REGEX,
                                evidence:   [`Gorilla mux HandleFunc in ${file.path}`],
                            }));
                        }
                    }
                } else if (type === "stdlib") {
                    // net/http: HandleFunc("/path", handler) — no method
                    while ((m = regex.exec(content)) !== null) {
                        facts.push(Fact.endpoint({
                            method:     "GET/POST",
                            path:       m[1],
                            service:    svc,
                            file:       file.path,
                            confidence: Fact.Confidence.REGEX,
                            evidence:   [`net/http HandleFunc in ${file.path}`],
                        }));
                    }
                } else {
                    // Gin / Echo / Fiber / Chi: router.METHOD("/path", handler)
                    while ((m = regex.exec(content)) !== null) {
                        facts.push(Fact.endpoint({
                            method:     m[1].toUpperCase(),
                            path:       m[2],
                            service:    svc,
                            file:       file.path,
                            confidence: Fact.Confidence.REGEX,
                            evidence:   [`${type} ${varName}.${m[1]}() in ${file.path}`],
                        }));
                    }
                }
            }

            // ── Axum routes (Rust-inspired pattern, just in case) ─────────────
            // (Axum is Rust but included as a safety net — Go code won't match)

            // ── Database detection via imports ─────────────────────────────────
            for (const { pattern, tech } of DB_IMPORT_PATTERNS) {
                if (pattern.test(content) && !seenDb.has(tech)) {
                    seenDb.add(tech);
                    facts.push(Fact.datastore({
                        technology: tech,
                        service:    svc,
                        confidence: Fact.Confidence.REGEX,
                        evidence:   [`Import detected in ${file.path}`],
                    }));
                }
            }

            // ── Env var extraction ────────────────────────────────────────────
            const envMatches = content.matchAll(/os\.(?:Getenv|LookupEnv)\s*\(\s*[""]([A-Z_][A-Z0-9_]*)[""]/g);
            for (const m of envMatches) {
                facts.push(Fact.envvar({
                    key:        m[1],
                    source:     "code",
                    service:    svc,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`os.Getenv() in ${file.path}`],
                }));
            }

            // Viper: viper.GetString("key")
            const viperMatches = content.matchAll(/viper\.Get\w+\s*\(\s*[""]([^""]+)[""]/g);
            for (const m of viperMatches) {
                facts.push(Fact.envvar({
                    key:        m[1].toUpperCase().replace(/-/g, "_"),
                    source:     "code",
                    service:    svc,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`viper.GetString() in ${file.path}`],
                }));
            }

            // ── Service-to-service call detection ─────────────────────────────
            // http.Get("url") / http.Post("url") / client.Do(req)
            const httpMatches = content.matchAll(/http\.(Get|Post)\s*\(\s*[""]([^""]+)[""]/g);
            for (const m of httpMatches) {
                facts.push(Fact.servicecall({
                    from:       svc,
                    url:        m[2],
                    method:     m[1].toUpperCase(),
                    file:       file.path,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`http.${m[1]}() call in ${file.path}`],
                }));
            }

            // ── Event / Message Broker detection ──────────────────────────────
            // Sarama ProducerMessage{Topic: "topic"}
            const saramaMatches = content.matchAll(/ProducerMessage\s*\{[^}]*Topic:\s*[""]([^""]+)[""]/g);
            for (const sm of saramaMatches) {
                facts.push(Fact.event({
                    topic:      sm[1],
                    producer:   svc,
                    broker:     "Kafka",
                    file:       file.path,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`Kafka Sarama ProducerMessage with Topic "${sm[1]}" in ${file.path}`],
                }));
            }
        }

        return { facts, parseErrors };
    }
}

export default new GoPlugin();
