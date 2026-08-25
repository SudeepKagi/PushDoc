/**
 * Ecosystems Technology Catalog — ecosystems.catalog.js
 *
 * Curated technology dictionaries and classification maps across 12+ programming ecosystems.
 */

// ── Node.js / JavaScript / TypeScript ────────────────────────────────────────

export const JS_FRAMEWORKS = Object.freeze({
    express: "Express",         fastify: "Fastify",       koa: "Koa",
    "@hapi/hapi": "Hapi",       "@nestjs/core": "NestJS", restify: "Restify",
    hono: "Hono",               elysia: "Elysia",         polka: "Polka",
    react: "React",             next: "Next.js",           nuxt: "Nuxt",
    vue: "Vue",                 "@vue/core": "Vue",        angular: "Angular",
    "@angular/core": "Angular", svelte: "Svelte",         "@sveltejs/kit": "SvelteKit",
    "solid-js": "SolidJS",      preact: "Preact",         remix: "Remix",
    "@remix-run/react": "Remix",astro: "Astro",           qwik: "Qwik",
    trpc: "tRPC",               "@trpc/server": "tRPC",   graphql: "GraphQL",
});

export const JS_DATABASES = Object.freeze({
    mongoose: "MongoDB (Mongoose)",           mongodb: "MongoDB",
    "@prisma/client": "Prisma",               "drizzle-orm": "Drizzle ORM",
    pg: "PostgreSQL",                         postgres: "PostgreSQL",
    mysql2: "MySQL",                          mysql: "MySQL",
    sqlite3: "SQLite",                        "better-sqlite3": "SQLite",
    sequelize: "Sequelize",                   typeorm: "TypeORM",
    knex: "Knex.js",                          "@libsql/client": "libSQL / Turso",
    redis: "Redis",                           ioredis: "Redis",
    "@google-cloud/firestore": "Firestore",   "firebase-admin": "Firestore",
    "@aws-sdk/client-dynamodb": "DynamoDB",   "@elastic/elasticsearch": "Elasticsearch",
    "neo4j-driver": "Neo4j",                  "cassandra-driver": "Cassandra",
});

export const JS_AUTH = Object.freeze({
    passport: "Passport",                     "passport-local-mongoose": "Passport Local",
    "passport-jwt": "Passport JWT",           jsonwebtoken: "JWT",
    clerk: "Clerk",                           "@clerk/nextjs": "Clerk",
    "next-auth": "NextAuth",                  "@auth/core": "Auth.js",
    "better-auth": "Better Auth",             lucia: "Lucia",
    "express-session": "Express Session",     bcrypt: "bcrypt",
    bcryptjs: "bcrypt",                       argon2: "Argon2",
});

export const JS_STORAGE = Object.freeze({
    cloudinary: "Cloudinary",
    "multer-storage-cloudinary": "Cloudinary",
    "@aws-sdk/client-s3": "AWS S3",           "aws-sdk": "AWS S3",
    "@google-cloud/storage": "Google Cloud Storage",
    "@azure/storage-blob": "Azure Blob Storage",
    multer: "Multer",                         uploadthing: "Uploadthing",
    formidable: "Formidable",
});

export const JS_UTILITY = Object.freeze(new Set([
    "typescript", "eslint", "prettier", "jest", "vitest", "mocha", "chai",
    "webpack", "vite", "rollup", "esbuild", "parcel", "nodemon", "ts-node",
    "tsx", "concurrently", "cross-env", "dotenv", "rimraf", "husky",
    "lint-staged", "supertest", "playwright", "@playwright/test", "cypress",
]));

// ── Python ───────────────────────────────────────────────────────────────────

export const PYTHON_FRAMEWORKS = Object.freeze({
    django: "Django",                 "djangorestframework": "Django REST Framework",
    flask: "Flask",                   fastapi: "FastAPI",
    tornado: "Tornado",               aiohttp: "aiohttp",
    starlette: "Starlette",           sanic: "Sanic",
    falcon: "Falcon",                 bottle: "Bottle",
    litestar: "Litestar",             quart: "Quart",
    celery: "Celery",
});

export const PYTHON_DATABASES = Object.freeze({
    sqlalchemy: "SQLAlchemy",         "psycopg2": "PostgreSQL (psycopg2)",
    "psycopg2-binary": "PostgreSQL",  pymysql: "MySQL (PyMySQL)",
    pymongo: "MongoDB (PyMongo)",     motor: "MongoDB (Motor/async)",
    redis: "Redis",                   "redis-py": "Redis",
    aioredis: "Redis (async)",        elasticsearch: "Elasticsearch",
    "tortoise-orm": "Tortoise ORM",   peewee: "Peewee ORM",
    "databases": "Databases (async)", alembic: "Alembic (migrations)",
    "firebase-admin": "Firestore",    "google-cloud-firestore": "Firestore",
    cassandra: "Cassandra",           "cassandra-driver": "Cassandra",
});

export const PYTHON_AUTH = Object.freeze({
    "django-allauth": "Django Allauth",   "djangorestframework-simplejwt": "JWT",
    pyjwt: "JWT",                         passlib: "Passlib",
    bcrypt: "bcrypt",                     "python-jose": "JOSE / JWT",
    authlib: "Authlib / OAuth",           "fastapi-users": "FastAPI Users",
});

// ── Java / Kotlin ────────────────────────────────────────────────────────────

export const JAVA_FRAMEWORKS = Object.freeze({
    "spring-boot-starter-web": "Spring Boot",
    "spring-boot-starter": "Spring Boot",
    "spring-boot-starter-webflux": "Spring WebFlux",
    "quarkus-core": "Quarkus",
    "quarkus-resteasy": "Quarkus",
    "micronaut-core": "Micronaut",
    "micronaut-http": "Micronaut",
    "helidon-webserver": "Helidon",
    "javalin": "Javalin",
    "ktor-server-core": "Ktor",
    "dropwizard-core": "Dropwizard",
    "vertx-core": "Vert.x",
    "play": "Play Framework",
});

export const JAVA_DATABASES = Object.freeze({
    "spring-boot-starter-data-jpa": "Spring Data JPA",
    "spring-boot-starter-data-mongodb": "Spring Data MongoDB",
    "spring-boot-starter-data-redis": "Redis (Spring Data)",
    "hibernate-core": "Hibernate",
    "mybatis-spring-boot-starter": "MyBatis",
    "r2dbc-postgresql": "PostgreSQL (R2DBC)",
    "postgresql": "PostgreSQL",
    "mysql-connector-java": "MySQL",
    "mysql-connector-j": "MySQL",
    "h2": "H2 (in-memory)",
    "mongodb-driver": "MongoDB",
    "jedis": "Redis (Jedis)",
    "lettuce-core": "Redis (Lettuce)",
    "elasticsearch-rest-high-level-client": "Elasticsearch",
});

// ── Go ───────────────────────────────────────────────────────────────────────

export const GO_FRAMEWORKS = Object.freeze({
    "github.com/gin-gonic/gin": "Gin",
    "github.com/labstack/echo": "Echo",
    "github.com/labstack/echo/v4": "Echo",
    "github.com/gofiber/fiber": "Fiber",
    "github.com/gofiber/fiber/v2": "Fiber",
    "github.com/go-chi/chi": "Chi",
    "github.com/go-chi/chi/v5": "Chi",
    "github.com/gorilla/mux": "Gorilla Mux",
    "github.com/beego/beego": "Beego",
    "github.com/gobuffalo/buffalo": "Buffalo",
    "github.com/valyala/fasthttp": "FastHTTP",
    "net/http": "net/http (stdlib)",
});

export const GO_DATABASES = Object.freeze({
    "gorm.io/gorm": "GORM",
    "gorm.io/driver/postgres": "PostgreSQL (GORM)",
    "gorm.io/driver/mysql": "MySQL (GORM)",
    "gorm.io/driver/sqlite": "SQLite (GORM)",
    "github.com/jmoiern/sqlx": "sqlx",
    "github.com/lib/pq": "PostgreSQL",
    "github.com/go-sql-driver/mysql": "MySQL",
    "github.com/mattn/go-sqlite3": "SQLite",
    "go.mongodb.org/mongo-driver": "MongoDB",
    "github.com/redis/go-redis": "Redis",
    "github.com/go-redis/redis": "Redis",
    "entgo.io/ent": "Ent ORM",
});

// ── Rust ─────────────────────────────────────────────────────────────────────

export const RUST_FRAMEWORKS = Object.freeze({
    "actix-web": "Actix Web",
    axum: "Axum",
    rocket: "Rocket",
    warp: "Warp",
    tide: "Tide",
    poem: "Poem",
    salvo: "Salvo",
});

export const RUST_DATABASES = Object.freeze({
    sqlx: "SQLx",
    diesel: "Diesel",
    "sea-orm": "SeaORM",
    mongodb: "MongoDB",
    redis: "Redis",
    "tokio-postgres": "PostgreSQL",
    rusqlite: "SQLite",
});

// ── PHP ──────────────────────────────────────────────────────────────────────

export const PHP_FRAMEWORKS = Object.freeze({
    "laravel/framework": "Laravel",
    "laravel/lumen-framework": "Lumen",
    "symfony/symfony": "Symfony",
    "symfony/http-kernel": "Symfony",
    "slim/slim": "Slim",
    "codeigniter4/framework": "CodeIgniter 4",
    "yiisoft/yii2": "Yii2",
    "cakephp/cakephp": "CakePHP",
    "phalcon/phalcon": "Phalcon",
});

export const PHP_DATABASES = Object.freeze({
    "doctrine/orm": "Doctrine ORM",
    "doctrine/dbal": "Doctrine DBAL",
    "illuminate/database": "Eloquent (Laravel)",
    "mongodb/mongodb": "MongoDB",
    "predis/predis": "Redis (Predis)",
    "php-redis": "Redis",
});

// ── Ruby ─────────────────────────────────────────────────────────────────────

export const RUBY_FRAMEWORKS = Object.freeze({
    rails: "Ruby on Rails",
    sinatra: "Sinatra",
    hanami: "Hanami",
    roda: "Roda",
    grape: "Grape",
    "rack": "Rack",
});

export const RUBY_DATABASES = Object.freeze({
    "activerecord": "ActiveRecord",
    "mongoid": "Mongoid (MongoDB)",
    "redis": "Redis",
    "pg": "PostgreSQL",
    "mysql2": "MySQL",
    "sqlite3": "SQLite",
    "sequel": "Sequel ORM",
});

// ── .NET / C# ────────────────────────────────────────────────────────────────

export const DOTNET_FRAMEWORKS = Object.freeze({
    "Microsoft.AspNetCore": "ASP.NET Core",
    "Microsoft.AspNetCore.App": "ASP.NET Core",
    "Microsoft.AspNetCore.Mvc": "ASP.NET Core MVC",
    "Microsoft.AspNetCore.Blazor": "Blazor",
    "Blazor": "Blazor",
    "Carter": "Carter (Minimal APIs)",
    "FastEndpoints": "FastEndpoints",
});

export const DOTNET_DATABASES = Object.freeze({
    "Microsoft.EntityFrameworkCore": "Entity Framework Core",
    "Microsoft.EntityFrameworkCore.SqlServer": "SQL Server (EF Core)",
    "Npgsql.EntityFrameworkCore.PostgreSQL": "PostgreSQL (EF Core)",
    "Pomelo.EntityFrameworkCore.MySql": "MySQL (EF Core)",
    "MongoDB.Driver": "MongoDB",
    "StackExchange.Redis": "Redis",
    "Dapper": "Dapper",
});

// ── Dart / Flutter ───────────────────────────────────────────────────────────

export const DART_FRAMEWORKS = Object.freeze({
    flutter: "Flutter",
    shelf: "Shelf",
    dart_frog: "Dart Frog",
    "dart_frog": "Dart Frog",
    conduit: "Conduit",
    serverpod: "Serverpod",
});

// ── Elixir ───────────────────────────────────────────────────────────────────

export const ELIXIR_FRAMEWORKS = Object.freeze({
    phoenix: "Phoenix",
    plug: "Plug",
    absinthe: "Absinthe (GraphQL)",
});

export const ELIXIR_DATABASES = Object.freeze({
    ecto: "Ecto",
    postgrex: "PostgreSQL",
    myxql: "MySQL",
    redix: "Redis",
});

// ── Universal Heuristics for Unrecognized Dependencies ───────────────────────

export const UNKNOWN_HEURISTICS = Object.freeze([
    { pattern: /-(orm|db|database|driver|client|connector)$/i, category: "database"       },
    { pattern: /^(db|database|mongo|mysql|pg|sql|redis|cache)/i, category: "database"     },
    { pattern: /-(auth|oauth|jwt|session|cookie|login)$/i,     category: "authentication" },
    { pattern: /^(auth|passport-|oauth|jwt)/i,                 category: "authentication" },
    { pattern: /-(storage|upload|cdn|bucket|blob|s3)$/i,       category: "storage"        },
    { pattern: /^(upload|storage|s3-|blob)/i,                  category: "storage"        },
    { pattern: /-(framework|server|router|http|api)$/i,        category: "framework"      },
    { pattern: /^(micro|nano|pico|api-|server-)/i,             category: "framework"      },
]);

export const LOCKFILE_MAP = Object.freeze({
    "package-lock.json": "npm",   "yarn.lock": "Yarn",
    "pnpm-lock.yaml": "pnpm",     "bun.lock": "Bun",
    "bun.lockb": "Bun",           "Pipfile.lock": "Pipenv",
    "poetry.lock": "Poetry",      "pdm.lock": "PDM",
});

export const EXTENSION_LANGUAGE_MAP = Object.freeze({
    ".ts": "TypeScript",  ".tsx": "TypeScript",
    ".js": "JavaScript",  ".jsx": "JavaScript",
    ".mjs": "JavaScript", ".cjs": "JavaScript",
    ".py": "Python",      ".pyi": "Python",
    ".java": "Java",      ".kt": "Kotlin",  ".kts": "Kotlin",
    ".go": "Go",
    ".rs": "Rust",
    ".rb": "Ruby",
    ".php": "PHP",
    ".cs": "C#",          ".fs": "F#",
    ".cpp": "C++",        ".cc": "C++",     ".cxx": "C++",
    ".c": "C",
    ".dart": "Dart",
    ".ex": "Elixir",      ".exs": "Elixir",
    ".swift": "Swift",
    ".scala": "Scala",
    ".clj": "Clojure",    ".cljs": "ClojureScript",
    ".hs": "Haskell",     ".lhs": "Haskell",
    ".ml": "OCaml",       ".mli": "OCaml",
    ".r": "R",            ".R": "R",
});

export const IGNORED_DIRS = Object.freeze(new Set([
    "node_modules", "dist", "build", ".next", "coverage", ".git",
    "vendor", "public", "static", ".turbo", "out", "__pycache__",
    ".venv", "venv", "env", "target", "bin", "obj", ".gradle",
    ".m2", "Pods",
]));
