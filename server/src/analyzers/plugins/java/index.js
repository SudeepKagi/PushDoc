/**
 * Java Plugin — plugins/java/index.js
 *
 * Text-pattern extraction for Java and Kotlin web frameworks.
 *
 * SUPPORTED FRAMEWORKS
 * ────────────────────
 *   Spring Boot / Spring MVC
 *     @GetMapping("/path")
 *     @PostMapping("/path")
 *     @PutMapping("/path")
 *     @DeleteMapping("/path")
 *     @PatchMapping("/path")
 *     @RequestMapping(value = "/path", method = RequestMethod.GET)
 *
 *   Quarkus (JAX-RS annotations)
 *     @GET  @POST  @PUT  @DELETE  @PATCH
 *     @Path("/users")
 *
 *   Micronaut
 *     @Get("/path")  @Post("/path") etc.
 *
 *   Javalin
 *     app.get("/path", ...)
 *     app.post("/path", ...)
 *
 * DATABASE DETECTION (via import statements)
 * ──────────────────────────────────────────
 *   Spring Data JPA       import ...jpa...
 *   Spring Data MongoDB   import ...mongodb...
 *   JDBC                  import java.sql.Connection
 *   Hibernate             import org.hibernate...
 *   MyBatis               import org.mybatis...
 *   Redis                 import ...jedis... or ...lettuce...
 *
 * ENV VAR DETECTION
 * ─────────────────
 *   System.getenv("KEY")
 *   @Value("${KEY}")        (Spring)
 *   @ConfigProperty(name = "KEY")  (Quarkus)
 *
 * CONFIDENCE: "medium" — annotation regex, not a real Java parser
 */

import { AnalyzerPlugin } from "../../core/analyzer.interface.js";
import * as Fact           from "../../core/fact.schema.js";

const JAVA_EXTENSIONS = new Set([".java", ".kt", ".kts"]);

// Spring Boot / Spring MVC method-specific mappings
const SPRING_METHOD_ANNOTATIONS = [
    { annotation: "GetMapping",    method: "GET"    },
    { annotation: "PostMapping",   method: "POST"   },
    { annotation: "PutMapping",    method: "PUT"    },
    { annotation: "DeleteMapping", method: "DELETE" },
    { annotation: "PatchMapping",  method: "PATCH"  },
];

export class JavaPlugin extends AnalyzerPlugin {

    name()       { return "Java/Kotlin (annotation pattern extraction)"; }
    confidence() { return "medium"; }

    getCapabilities() {
        return {
            languages: ["java", "kotlin"],
            frameworks: ["spring-boot", "spring-mvc", "quarkus", "micronaut", "javalin"],
            produces: ["endpoint", "datastore", "envvar", "servicecall", "event"],
        };
    }

    detect(serviceFiles, manifestInfo) {
        if (manifestInfo?.ecosystem === "java") return true;
        return serviceFiles.some(f => JAVA_EXTENSIONS.has((f.extension || "").toLowerCase()));
    }

    analyze(serviceFiles, manifestInfo, serviceName) {
        const facts       = [];
        const parseErrors = [];
        const svc         = serviceName || null;
        const seenDb      = new Set();

        const javaFiles = serviceFiles.filter(f =>
            JAVA_EXTENSIONS.has((f.extension || "").toLowerCase())
        );

        for (const file of javaFiles) {
            const content = file.content || "";

            // ── Class-level @RequestMapping base path ─────────────────────────
            const classMappingMatch = content.match(
                /@RequestMapping\s*\(\s*(?:value\s*=\s*)?["']([^"']+)["']/
            );
            const classPath = classMappingMatch?.[1] || "";

            // ── Spring method-specific annotations ────────────────────────────
            for (const { annotation, method } of SPRING_METHOD_ANNOTATIONS) {
                const regex = new RegExp(
                    `@${annotation}(?:\\s*\\(\\s*(?:value\\s*=\\s*)?["']([^"']+)["']\\s*\\)|(?![(\\w]))`,
                    "g"
                );
                let m;
                while ((m = regex.exec(content)) !== null) {
                    const subPath = m[1] || "";
                    const path = normalizePath(classPath + (subPath ? (subPath.startsWith("/") ? subPath : "/" + subPath) : ""));
                    facts.push(Fact.endpoint({
                        method,
                        path,
                        service:    svc,
                        file:       file.path,
                        confidence: Fact.Confidence.REGEX,
                        evidence:   [`@${annotation} in ${file.path}`],
                    }));
                }
            }

            // ── @RequestMapping with method = RequestMethod.XXX ───────────────
            {
                const regex = /@RequestMapping\s*\([^)]*value\s*=\s*["']([^"']+)["'][^)]*method\s*=\s*RequestMethod\.(\w+)/gi;
                let m;
                while ((m = regex.exec(content)) !== null) {
                    facts.push(Fact.endpoint({
                        method:     m[2].toUpperCase(),
                        path:       normalizePath(classPath + m[1]),
                        service:    svc,
                        file:       file.path,
                        confidence: Fact.Confidence.REGEX,
                        evidence:   [`@RequestMapping in ${file.path}`],
                    }));
                }
            }

            // ── Quarkus JAX-RS: @Path + @GET/@POST etc. ───────────────────────
            {
                const pathMatch = content.match(/@Path\s*\(\s*["']([^"']+)["']\s*\)/);
                if (pathMatch) {
                    const jaxPath = pathMatch[1];
                    for (const method of ["GET", "POST", "PUT", "DELETE", "PATCH"]) {
                        if (new RegExp(`@${method}\\b`).test(content)) {
                            facts.push(Fact.endpoint({
                                method,
                                path:       normalizePath(classPath + jaxPath),
                                service:    svc,
                                file:       file.path,
                                confidence: Fact.Confidence.REGEX,
                                evidence:   [`JAX-RS @${method} + @Path in ${file.path}`],
                            }));
                        }
                    }
                }
            }

            // ── Micronaut: @Get/@Post etc. ─────────────────────────────────────
            {
                for (const [ann, method] of [["Get","GET"],["Post","POST"],["Put","PUT"],["Delete","DELETE"],["Patch","PATCH"]]) {
                    const regex = new RegExp(`@${ann}\\s*\\(\\s*["']([^"']+)["']`, "g");
                    let m;
                    while ((m = regex.exec(content)) !== null) {
                        facts.push(Fact.endpoint({
                            method,
                            path:       normalizePath(m[1]),
                            service:    svc,
                            file:       file.path,
                            confidence: Fact.Confidence.REGEX,
                            evidence:   [`Micronaut @${ann} in ${file.path}`],
                        }));
                    }
                }
            }

            // ── Javalin: app.get("/path", ...) ────────────────────────────────
            {
                const regex = /\bapp\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/g;
                let m;
                while ((m = regex.exec(content)) !== null) {
                    facts.push(Fact.endpoint({
                        method:     m[1].toUpperCase(),
                        path:       m[2],
                        service:    svc,
                        file:       file.path,
                        confidence: Fact.Confidence.REGEX,
                        evidence:   [`Javalin app.${m[1]}() in ${file.path}`],
                    }));
                }
            }

            // ── Database detection via imports ────────────────────────────────
            const dbImports = [
                { pattern: /import\s+.*\.jpa\./,             tech: "Spring Data JPA" },
                { pattern: /import\s+.*\.mongodb\./,         tech: "Spring Data MongoDB" },
                { pattern: /import\s+org\.hibernate\./,      tech: "Hibernate" },
                { pattern: /import\s+org\.mybatis\./,        tech: "MyBatis" },
                { pattern: /import\s+java\.sql\.Connection/,  tech: "JDBC" },
                { pattern: /import\s+.*jedis\./,             tech: "Redis (Jedis)" },
                { pattern: /import\s+.*lettuce\./,           tech: "Redis (Lettuce)" },
                { pattern: /import\s+.*r2dbc\./,             tech: "R2DBC (Reactive SQL)" },
                { pattern: /import\s+.*elasticsearch\./,     tech: "Elasticsearch" },
            ];

            for (const { pattern, tech } of dbImports) {
                if (pattern.test(content) && !seenDb.has(tech)) {
                    seenDb.add(tech);
                    facts.push(Fact.datastore({
                        technology: tech,
                        service:    svc,
                        confidence: Fact.Confidence.REGEX,
                        evidence:   [`Import statement detected in ${file.path}`],
                    }));
                }
            }

            // ── Env var extraction ────────────────────────────────────────────
            // System.getenv("KEY")
            const sysEnvMatches = content.matchAll(/System\.getenv\s*\(\s*["']([A-Z_][A-Z0-9_]*)["']/g);
            for (const m of sysEnvMatches) {
                facts.push(Fact.envvar({
                    key:        m[1],
                    source:     "code",
                    service:    svc,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`System.getenv() in ${file.path}`],
                }));
            }

            // @Value("${KEY}")  Spring
            const springValueMatches = content.matchAll(/@Value\s*\(\s*["']\$\{([^}]+)\}/g);
            for (const m of springValueMatches) {
                facts.push(Fact.envvar({
                    key:        m[1].replace(/:[^}]*$/, ""), // strip :default
                    source:     "code",
                    service:    svc,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`@Value annotation in ${file.path}`],
                }));
            }

            // ── Service-to-service calls ──────────────────────────────────────
            // RestTemplate.getForObject / WebClient.get().uri(...)
            const restMatches = content.matchAll(/restTemplate\.\w+\(\s*["']([^"']+)["']/gi);
            for (const m of restMatches) {
                facts.push(Fact.servicecall({
                    from:       svc,
                    url:        m[1],
                    file:       file.path,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`RestTemplate call in ${file.path}`],
                }));
            }

            // ── Message Brokers (Kafka / RabbitMQ) ────────────────────────────
            // @KafkaListener(topics = "order-events")
            const kafkaListenerMatches = content.matchAll(/@KafkaListener\s*\([^)]*topics\s*=\s*["']([^"']+)["']/g);
            for (const km of kafkaListenerMatches) {
                facts.push(Fact.event({
                    topic:      km[1],
                    consumer:   svc,
                    broker:     "Kafka",
                    file:       file.path,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`@KafkaListener(topics = "${km[1]}") in ${file.path}`],
                }));
            }

            // kafkaTemplate.send("order-events", ...)
            const kafkaSendMatches = content.matchAll(/kafkaTemplate\.send\s*\(\s*["']([^"']+)["']/g);
            for (const km of kafkaSendMatches) {
                facts.push(Fact.event({
                    topic:      km[1],
                    producer:   svc,
                    broker:     "Kafka",
                    file:       file.path,
                    confidence: Fact.Confidence.REGEX,
                    evidence:   [`kafkaTemplate.send("${km[1]}") in ${file.path}`],
                }));
            }
        }

        return { facts, parseErrors };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalizePath(path) {
    // Ensure leading slash, normalize double slashes
    const p = ("/" + path).replace(/\/+/g, "/");
    return p || "/";
}

export default new JavaPlugin();
