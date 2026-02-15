import Bun, { type BunRequest } from "bun"

type ExtractSearchParams<S extends string> = S extends `${infer _}?${infer Q}` ? Q : ""
type SplitParams<Q extends string> = Q extends `${infer K}&${infer R}` 
    ? { [key in K | keyof SplitParams<R>]: string } 
    : Q extends `${infer K}` 
        ? { [key in K]: string } : {}
type ParseSearchParams<S extends string> = SplitParams<ExtractSearchParams<S>>

export type RouteParams<R extends string = string> = { 
    [Key in keyof Bun.Serve.ExtractRouteParams<R>]: Bun.Serve.ExtractRouteParams<R>[Key] 
} & {}

export type QueryParams<S extends string = string> = {
    [key in keyof ParseSearchParams<S>]: ParseSearchParams<S>[key]
} & {}

export class PomRequest<R extends string = string> {
    raw: BunRequest
    private _url: URL | undefined = undefined
    params: RouteParams<R>

    private _query: QueryParams<R> | null = null

    get cookies(): Bun.CookieMap {
        return this.raw.cookies
    }

    get query(): QueryParams<R> {
        if (this._query) return this._query
        const q: Record<string, string> = {}

        this._url = this._url ?? new URL(this.raw.url)

        const s = this._url.search.slice(1) // remove '?'
        try {
            let i = 0
            while (i < s.length) {
                // find '=' or '&'
                let j = s.indexOf('=', i)
                if (j === -1) break
                const key = decodeURIComponent(s.slice(i, j))
                let k = s.indexOf('&', j + 1)
                if (k === -1) k = s.length
                const val = decodeURIComponent(s.slice(j + 1, k))
                q[key] = val
                i = k + 1
            }
        } catch (e) {
            throw new Error(`[server.PomRequest.query] Failed to parse: ${s}`)
        }
        return this._query = q as any
    }

    json<T>(): Promise<T> {
        return this.raw.json() as Promise<T>
    }

    text(): Promise<string> {
        return this.raw.text()
    }

    constructor(raw: BunRequest, params: RouteParams<R>) {
        this.raw = raw
        this.params = params
    }
}