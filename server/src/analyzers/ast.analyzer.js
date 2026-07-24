import * as parser from "@babel/parser";
import traverseModule from "@babel/traverse";

// Handle default/ESM import variations for @babel/traverse
const traverse = traverseModule.default || traverseModule;

/**
 * Parses JavaScript/TypeScript source code into an AST and extracts
 * deterministic architectural facts.
 */
export const analyzeAst = (repository) => {
    const apiCalls = [];
    const expressRoutes = [];
    const envVars = new Set();
    const envFileVars = [];

    // 1. Process .env.example or .env.sample files
    for (const file of repository.files || []) {
        const basename = file.path.split(/[/\\]/).pop().toLowerCase();
        if (basename === ".env.example" || basename === ".env.sample") {
            const lines = file.content.split("\n");
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith("#")) {
                    const eqIdx = trimmed.indexOf("=");
                    const key = eqIdx !== -1 ? trimmed.substring(0, eqIdx).trim() : trimmed;
                    if (key) {
                        envFileVars.push({ key, sourceFile: file.path });
                        envVars.add(key);
                    }
                }
            }
        }
    }

    // 2. Parse JS/TS/JSX/TSX source code files
    for (const file of repository.files || []) {
        const ext = file.extension ? file.extension.toLowerCase() : "";
        if (![".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"].includes(ext)) {
            continue;
        }

        try {
            const plugins = ["jsx", "asyncGenerators", "classProperties", "dynamicImport", "objectRestSpread"];
            if (ext === ".ts" || ext === ".tsx") {
                plugins.push("typescript");
            }

            const ast = parser.parse(file.content, {
                sourceType: "module",
                allowImportExportEverywhere: true,
                allowReturnOutsideFunction: true,
                plugins,
            });

            traverse(ast, {
                // A. Extract axios / fetch call sites
                CallExpression(path) {
                    const callee = path.node.callee;

                    // Detect fetch("URL") or fetch(`URL`)
                    if (callee.type === "Identifier" && callee.name === "fetch") {
                        const firstArg = path.node.arguments[0];
                        const url = extractUrlString(firstArg);
                        if (url) {
                            apiCalls.push({
                                method: "GET/POST",
                                url,
                                client: "fetch",
                                file: file.path,
                            });
                        }
                    }

                    // Detect axios.get("URL"), axios.post("URL"), axios("URL"), etc.
                    if (callee.type === "MemberExpression") {
                        if (
                            callee.object.type === "Identifier" &&
                            callee.object.name === "axios" &&
                            callee.property.type === "Identifier"
                        ) {
                            const method = callee.property.name.toUpperCase();
                            const firstArg = path.node.arguments[0];
                            const url = extractUrlString(firstArg);
                            if (url) {
                                apiCalls.push({
                                    method,
                                    url,
                                    client: "axios",
                                    file: file.path,
                                });
                            }
                        }
                    } else if (callee.type === "Identifier" && callee.name === "axios") {
                        const firstArg = path.node.arguments[0];
                        const url = extractUrlString(firstArg);
                        if (url) {
                            apiCalls.push({
                                method: "CUSTOM",
                                url,
                                client: "axios",
                                file: file.path,
                            });
                        }
                    }

                    // Detect Express routes: router.get('/path', ...) or app.post('/path', ...)
                    if (callee.type === "MemberExpression") {
                        const obj = callee.object;
                        const prop = callee.property;

                        const isRouterOrApp =
                            obj.type === "Identifier" &&
                            ["router", "app", "route"].includes(obj.name.toLowerCase());

                        const HTTP_METHODS = ["get", "post", "put", "delete", "patch", "use", "all"];
                        const isHttpMethod = prop.type === "Identifier" && HTTP_METHODS.includes(prop.name.toLowerCase());

                        if (isRouterOrApp && isHttpMethod) {
                            const firstArg = path.node.arguments[0];
                            if (firstArg && firstArg.type === "StringLiteral") {
                                expressRoutes.push({
                                    method: prop.name.toUpperCase(),
                                    path: firstArg.value,
                                    file: file.path,
                                });
                            }
                        }
                    }
                },

                // B. Extract process.env.VARIABLE_NAME
                MemberExpression(path) {
                    const node = path.node;
                    if (
                        node.object.type === "MemberExpression" &&
                        node.object.object.type === "Identifier" &&
                        node.object.object.name === "process" &&
                        node.object.property.type === "Identifier" &&
                        node.object.property.name === "env" &&
                        node.property.type === "Identifier"
                    ) {
                        envVars.add(node.property.name);
                    }
                },
            });
        } catch {
            // Silently ignore syntax errors in individual files to prevent job failures
        }
    }

    return {
        apiCalls,
        expressRoutes,
        envVars: Array.from(envVars),
        envFileVars,
    };
};

/**
 * Extracts raw string or template literal representation from an AST node.
 */
function extractUrlString(node) {
    if (!node) return null;

    if (node.type === "StringLiteral") {
        return node.value;
    }

    if (node.type === "TemplateLiteral") {
        let result = "";
        for (let i = 0; i < node.quasis.length; i++) {
            result += node.quasis[i].value.raw;
            if (i < node.expressions.length) {
                const expr = node.expressions[i];
                if (expr.type === "Identifier") {
                    result += `\${${expr.name}}`;
                } else {
                    result += "${...}";
                }
            }
        }
        return result;
    }

    return null;
}
