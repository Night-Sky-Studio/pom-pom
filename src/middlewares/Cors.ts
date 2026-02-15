import type { MiddlewareFunction, PomRequest, PomResponse } from ".."

interface CorsOptions {
    origin?: string
    methods?: string[]
    headers?: string[]
}

export function cors({ 
    origin = "*", 
    methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    headers = ["Content-Type", "Authorization"] 
}: CorsOptions = {}): MiddlewareFunction {
    return (req: PomRequest<any>, res: PomResponse) => {
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', methods.join(', '))
        res.header('Access-Control-Allow-Headers', headers.join(', '))
        res.header("Access-Control-Allow-Credentials", `${res.headers["Access-Control-Allow-Origin"] !== "*"}`)

        if (req.raw.method === "OPTIONS") {
            return res.status(204).build()
        }
    }
}