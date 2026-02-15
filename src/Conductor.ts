import Bun, { type MaybePromise, type BunRequest } from "bun"
import { PomRequest, type RouteParams } from "./Request"
import { PomOptions } from "./Options"
import { PomResponse } from "./Response"

export type MiddlewareFunction = (req: PomRequest<any>, res: PomResponse) => MaybePromise<Response | void>

/**
 * Middleware modifies the current request
 * 
 * It should either return a Response to short-circuit the request,
 * or return nothing to continue processing
 * 
 * On 2nd option, it can modify the request/response objects directly
 */
export type Middleware = MiddlewareFunction | MaybePromise<void>

export type RouteHandler<R extends string> = (req: PomRequest<R>, res: PomResponse) => MaybePromise<PomResponse | void>

interface RouteHandlers<R extends string = string> {
    GET?: RouteHandler<R>
    POST?: RouteHandler<R>
    PUT?: RouteHandler<R>
    DELETE?: RouteHandler<R>
    PATCH?: RouteHandler<R>
    OPTIONS?: RouteHandler<R>
    [key: string]: RouteHandler<R> | undefined
}

export class PomPom {
    private middlewares: Middleware[] = []
    private routes: Map<string, RouteHandlers<any>> = new Map()
    public opts: PomOptions

    constructor(opts?: PomOptions) {
        this.opts = opts ?? new PomOptions()
    }

    public use(middleware: Middleware) {
        this.middlewares.push(middleware)
    }

    public route<R extends string>(path: R, handlers: RouteHandlers<R>) {
        // remove trailing slash except for root
        const normalizedPath = path.endsWith('/') && path.length > 1 
            ? path.slice(0, -1) 
            : path

        if (this.routes.has(normalizedPath)) {
            const existingHandlers = this.routes.get(normalizedPath)!
            this.routes.set(normalizedPath, { ...existingHandlers, ...handlers })
            return this
        }

        this.routes.set(normalizedPath, handlers)        
        return this
    }

    public get<R extends string>(path: R, handler: RouteHandler<R>) {
        return this.route<R>(path, { GET: handler })
    }

    public post<R extends string>(path: R, handler: RouteHandler<R>) {
        return this.route<R>(path, { POST: handler })
    }

    public put<R extends string>(path: R, handler: RouteHandler<R>) {
        return this.route<R>(path, { PUT: handler })
    }

    /** js syntax workaround */
    private _delete<R extends string>(path: R, handler: RouteHandler<R>) {
        return this.route<R>(path, { DELETE: handler })
    }

    public delete<R extends string>(path: R, handler: RouteHandler<R>) {
        return this.route<R>(path, { DELETE: handler })
    }

    public patch<R extends string>(path: R, handler: RouteHandler<R>) {
        return this.route<R>(path, { PATCH: handler })
    }

    public options<R extends string>(path: R, handler: RouteHandler<R>) {
        return this.route<R>(path, { OPTIONS: handler })
    }

    private async execMiddleware(mw: Middleware, req: PomRequest<any>, res: PomResponse) {
        return typeof mw === 'function' ? await mw(req, res) : await mw
    }

    private buildRoutes() {
        const routes: Bun.Serve.Routes<never, any> = {}

        for (const [path, handlers] of this.routes.entries()) {
            // Pre-parse path structure to avoid parsing on every request
            const pathSegments = path.split('/').filter(Boolean)
            const paramDefs = pathSegments
                .map((segment, index) => {
                    if (segment.startsWith(':')) return { index, key: segment.slice(1).replace('?', ''), isWildcard: false }
                    if (segment.startsWith('*')) return { index, key: segment.slice(1), isWildcard: true }
                    return null
                })
                .filter((def): def is NonNullable<typeof def> => def !== null)

            
            routes[path] = async (request: BunRequest<any>) => {
                try {
                    const pomRequest = new PomRequest(request, request.params)

                    const response = new PomResponse()
                    
                    for (const middleware of this.middlewares) {
                        const mwResponse = await this.execMiddleware(middleware, pomRequest, response)
                        if (mwResponse) {
                            return mwResponse
                        }
                    }

                    const method = request.method.toUpperCase()
                    const handler = handlers[method]

                    if (handler) {
                        await handler(pomRequest, response)
                        return response.build()
                    }

                    return PomResponse.init({
                        status: 405,
                        body: "Method Not Allowed",
                    })
                } catch (error) {
                    console.error("[SERVER]", error)
                    return PomResponse.init({
                        status: 500,
                        body: `Internal Server Error: ${(error as Error).message}`
                    })
                }
            }

            console.log(`[SERVER] Built ${Object.keys(handlers).join(" ")} ${path}`)
        }

        return routes
    }

    public listen(port: number, callback?: () => void) {
        const routes = this.buildRoutes()

        const server = Bun.serve({
            port,
            routes,
            fetch: () => PomResponse.init({
                status: 404,
                body: "Not Found",
            }),
            error: (error: Error) => {
                console.error("[SERVER]", error)
                return PomResponse.init({
                    status: 500,
                    body: `${error.message}`
                })
            }
        })
        callback?.()
        return server
    }
}