/**
 * Python Plugin — plugins/python/index.js
 *
 * Text-pattern extraction for Python web frameworks.
 * No Python AST — uses regex on source files.
 *
 * SUPPORTED FRAMEWORKS
 * ────────────────────
 *   FastAPI    @app.get("/path")  @router.post("/path")
 *   Flask      @app.route("/path", methods=["GET"])
 *   Django     path("users/", views.handler)  re_path(r"^users/")
 *   Starlette  @app.route("/path", methods=["GET"])
 *   Sanic      @app.get("/path")
 *
 * DATABASE DETECTION
 * ──────────────────
 *   SQLAlchemy  create_engine("postgresql://...")
 *   pymongo     MongoClient(...)
 *   redis       redis.Redis(...)  redis.from_url(...)
 *   Tortoise    Tortoise.init(...)
 *
 * ENV VAR DETECTION
 * ─────────────────
 *   os.environ["KEY"]
 *   os.environ.get("KEY")
 *   os.getenv("KEY")
 *
 * CONFIDENCE: "medium" — regex on source, not real Python AST
 */

import { AnalyzerPlugin } from "../../core/analyzer.interface.js";
import * as Fact           from "../../core/fact.schema.js";

const PYTHON_EXTENSIONS = new Set([".py", ".pyi"]);

// Decorator patterns per framework
const ROUTE_PATTERNS = [
    // FastAPI / Starlette / Sanic: @app.METHOD("/path") or @router.METHOD("/path")
    {
        regex: /@(?:app|router|api|v\d+)\.(get|post|put|patch|delete|options|head)\s*\(\s*["']([^"']+)["']/gi,
        confidence: Fact.Confidence.REGEX,
        framework: "FastAPI/Starlette/Sanic",
    },
    // Flask: @app.route("/path", methods=["GET", "POST"])
    {
        regex: /@(?:app|blueprint|bp)\s*\.route\s*\(\s*["']([^"']+)["'][^)]*methods\s*=\s*\[([^\]]+)\]/gi,
        confidence: Fact.Confidence.REGEX,
        framework: "Flask",
        isFlask: true,
    },
    // Flask: @app.route("/path")  (no methods= → defaults to GET)
    {
        regex: /@(?:app|blueprint|bp)\s*\.route\s*\(\s*["']([^"']+)["']\s*\)/gi,
        confidence: Fact.Confidence.REGEX,
        framework: "Flask",
        isFlaskDefault: true,
    },
    // Django DRF: @api_view(['GET', 'POST'])  followed by def handler(...)  → path extracted from urls.py
    // (Django URL patterns are in urls.py, not in views — handled separately below)
];

// Database connection patterns
const DB_PATTERNS = [
    { regex: /create_engine\s*\(\s*["']([^"']+)["']/gi,     label: (m) => detectSqlDialect(m[1]) },
    { regex: /MongoClient\s*\(/gi,                           label: () => "MongoDB (PyMongo)" },
    { regex: /motor\.motor_asyncio/gi,                       label: () => "MongoDB (Motor)" },
    { regex: /redis\.Redis\s*\(/gi,                          label: () => "Redis" },
    { regex: /redis\.from_url\s*\(/gi,                       label: () => "Redis" },
    { regex: /aioredis\.create_redis/gi,                     label: () => "Redis (async)" },
    { regex: /elasticsearch\.Elasticsearch\s*\(/gi,          label: () => "Elasticsearch" },
    { regex: /Tortoise\.init\s*\(/gi,                        label: () => "Tortoise ORM" },
    { regex: /firebase_admin\.initialize_app/gi,             label: () => "Firebase / Firestore" },
    { regex: /cassandra\.cluster\.Cluster\s*\(/gi,           label: () => "Cassandra" },
];

export class PythonPlugin extends AnalyzerPlugin {

    name()       { return "Python (regex pattern extraction)"; }
    confidence() { return "medium"; }

    getCapabilities() {
        return {
            languages: ["python"],
            frameworks: ["fastapi", "flask", "django", "starlette", "sanic"],
            produces: ["endpoint", "datastore", "envvar", "servicecall", "event"],
        };
    }

    detect(serviceFiles, manifestInfo) {
        if (manifestInfo?.ecosystem === "python") return true;
        return serviceFiles.some(f => PYTHON_EXTENSIONS.has((f.extension || "").toLowerCase()));
    }

    analyze(serviceFiles, manifestInfo, serviceName) {
        const facts       = [];
        const parseErrors = [];
        const svc         = serviceName || null;
        const seenDb      = new Set();

        const pyFiles = serviceFiles.filter(f =>
            PYTHON_EXTENSIONS.has((f.extension || "").toLowerCase())
        );

        for (const file of pyFiles) {
            const content = file.content || "";

            // ── Route extraction ──────────────────────────────────────────────
            for (const pattern of ROUTE_PATTERNS) {
                if (pattern.isFlask) {
                    // Flask: extract methods from methods=[...] list
                    pattern.regex.lastIndex = 0;
                    let m;
                    while ((m = pattern.regex.exec(content)) !== null) {
                        const path    = m[1];
                        const methods = extractMethodsList(m[2]);
                        for (const method of methods) {
                            facts.push(Fact.endpoint({
                                method,
                                path,
                                service:    svc,
                                file:       file.path,
                                confidence: pattern.confidence,
                                evidence:   [`Flask @route in ${file.path}`],
                            }));
                        }
                    }
                } else if (pattern.isFlaskDefault) {
                    pattern.regex.lastIndex = 0;
                    let m;
                    while ((m = pattern.regex.exec(content)) !== null) {
                        facts.push(Fact.endpoint({
                            method:     "GET",
                            path:       m[1],
                            service:    svc,
                            file:       file.path,
                            confidence: pattern.confidence,
                            evidence:   [`Flask @route (default GET) in ${file.path}`],
                        }));
                    }
                } else {
                    // FastAPI / Starlette / Sanic: @app.METHOD("/path")
                    pattern.regex.lastIndex = 0;
                    let m;
                    while ((m = pattern.regex.exec(content)) !== null) {
                        facts.push(Fact.endpoint({
                            method:     m[1].toUpperCase(),
                            path:       m[2],
                            service:    svc,
                            file:       file.path,
                            confidence: pattern.confidence,
                            evidence:   [`${pattern.framework} decorator in ${file.path}`],
                        }));
                    }
                }
            }

            // ── Django urls.py: path("...", view) patterns ────────────────────
            if (file.path.includes("urls.py")) {
                const djangoRoutes = parseDjangoUrls(content, file.path, svc);
                facts.push(...djangoRoutes);
            }

            // ── Database detection ────────────────────────────────────────────
            for (const { regex, label } of DB_PATTERNS) {
                regex.lastIndex = 0;
                const m = regex.exec(content);
                if (m) {
                    const tech = label(m);
                    if (!seenDb.has(tech)) {
                        seenDb.add(tech);
                        facts.push(Fact.datastore({
                            technology: tech,
                            service:    svc,
                            confidence: Fact.Confidence.REGEX,
                            evidence:   [`Database connection pattern in ${file.path}`],
                        }));
                    }
                }
            }

            // ── Env var extraction ────────────────────────────────────────────
            const envMatches = content.matchAll(/os\.(?:environ(?:\.get)?\s*\[\s*["']|getenv\s*\(\s*["'])([A-Z_][A-Z0-9_]*)/g);
            for (const em of envMatches) {
                facts.push(Fact.envvar({
                    key:        em[1],
                    source:     "code",
                    service:    svc,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`os.environ reference in ${file.path}`],
                }));
            }

            // ── Service-to-service call detection ─────────────────────────────
            const httpMatches = content.matchAll(/requests\.(get|post|put|patch|delete)\s*\(\s*["']([^"']+)["']/g);
            for (const hm of httpMatches) {
                facts.push(Fact.servicecall({
                    from:       svc,
                    url:        hm[2],
                    method:     hm[1].toUpperCase(),
                    file:       file.path,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`requests.${hm[1]}() call in ${file.path}`],
                }));
            }

            // ── Event / Message Broker detection ──────────────────────────────
            // Kafka: producer.send("topic", ...)
            const kafkaMatches = content.matchAll(/(?:producer|client)\.send\s*\(\s*["']([^"']+)["']/g);
            for (const km of kafkaMatches) {
                facts.push(Fact.event({
                    topic:      km[1],
                    producer:   svc,
                    broker:     "Kafka",
                    file:       file.path,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`Kafka producer.send("${km[1]}") in ${file.path}`],
                }));
            }

            // Celery tasks: @app.task or @celery.task or send_task("task_name")
            const celeryMatches = content.matchAll(/@(?:app|celery)\.task|send_task\s*\(\s*["']([^"']+)["']/g);
            for (const cm of celeryMatches) {
                facts.push(Fact.event({
                    topic:      cm[1] || "celery-queue",
                    producer:   svc,
                    broker:     "Celery / Redis",
                    file:       file.path,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`Celery task queue in ${file.path}`],
                }));
            }
        }

        return { facts, parseErrors };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function parseDjangoUrls(content, filePath, serviceName) {
    const facts = [];

    // Django: path("users/", views.user_list, name="user-list")
    const pathMatches = content.matchAll(/\bpath\s*\(\s*["']([^"']+)["']\s*,\s*([\w.]+)/g);
    for (const m of pathMatches) {
        facts.push(Fact.endpoint({
            method:     "GET/POST", // Django routes don't declare method at url level
            path:       "/" + m[1].replace(/^\//, ""),
            handler:    m[2],
            service:    serviceName,
            file:       filePath,
            confidence: Fact.Confidence.REGEX,
            evidence:   [`Django urls.py path() in ${filePath}`],
        }));
    }

    return facts;
}

function extractMethodsList(raw) {
    // Parses: ["GET", "POST"] or ['GET', 'POST']
    const methods = [];
    const matches = raw.matchAll(/["']([A-Z]+)["']/g);
    for (const m of matches) methods.push(m[1]);
    return methods.length ? methods : ["GET"];
}

function detectSqlDialect(url) {
    if (/postgresql|postgres/i.test(url)) return "PostgreSQL (SQLAlchemy)";
    if (/mysql/i.test(url))               return "MySQL (SQLAlchemy)";
    if (/sqlite/i.test(url))              return "SQLite (SQLAlchemy)";
    return "SQL (SQLAlchemy)";
}

export default new PythonPlugin();
