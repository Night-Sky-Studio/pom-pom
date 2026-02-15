import assert from "node:assert"
import { readdir, exists, stat } from "node:fs/promises"
import path from "node:path"
import { type RouteHandler, PomPom } from "."

const Methods = ["get", "post", "put", "_delete", "patch"] as const

interface RouteModule<R extends string = string> {
    get?: RouteHandler<R>
    post?: RouteHandler<R>
    put?: RouteHandler<R>
    delete?: RouteHandler<R>
    patch?: RouteHandler<R>
    [key: string]: RouteHandler<R> | undefined
}

function toRouteSegment(fileName: string): string {
    if (fileName === "index") return "/"
    // Replace all [param] with :param
    return "/" + fileName.replace(
        /\[\#([a-zA-Z0-9_]+)\]|\[\*([a-zA-Z0-9_]+)\]|\[([a-zA-Z0-9_]+)\]/g,
        (_match, opt, rest, normal) => {
            if (opt) {
                // Optional param [#name]
                return `:${opt}?`
            } else if (rest) {
                // Catch-all [*rest]
                return `*${rest}`
            } else if (normal) {
                // Required param [name]
                return `:${normal}`
            }
            return _match
        }
    )
}

export async function registerRoutes(app: PomPom, routesDir: string = "routes", baseRoute = "") {
    assert(await exists(routesDir), `Routes directory "${routesDir}" does not exist`)

    const routesPath = path.resolve(routesDir)

    const files = await readdir(routesPath)

    for (const file of files) {
        try {
            const fullPath = path.join(routesPath, file)
            const fileStat = await stat(fullPath)
            if (fileStat.isDirectory()) {
                // Apply toRouteSegment to directory name
                await registerRoutes(app, fullPath, path.posix.join(baseRoute || '/', toRouteSegment(file)))
            } else if (file.endsWith(".ts") || file.endsWith(".js")) {
                const routePath = baseRoute + toRouteSegment(file.replace(/\.(ts|js)$/, ""))
                const module: RouteModule = await import(fullPath)

                for (const method of Methods) {
                    if (typeof module[method] === "function") {
                        const handler = module[method] as RouteHandler<any>
                        app[method](routePath, handler)
                        console.log(`[ROUTER] Registered ${method.toUpperCase()} ${routePath}`)
                    }
                }
            }
        } catch (err) {
            console.error(`[ROUTER] Error registering route ${baseRoute + toRouteSegment(file.replace(/\.(ts|js)$/, ""))}\n`, err)
        }
    }
}