export interface IPomResponseInit {
    status?: number
    contentType?: string
    headers?: Record<string, string>
    body?: any
}

export class PomResponse {
    code: number = 200
    contentType: string = "text/plain"
    body: any = null
    headers: Record<string, string> = {}

    static init({
        status, 
        contentType = "text/plain", 
        headers, 
        body
    }: IPomResponseInit = {}): Response {
        const res = new PomResponse()
        res.code = status ?? res.code
        res.contentType = contentType ?? res.contentType
        res.headers = headers ?? res.headers
        res.body = body ?? res.body
        return res.build()
    }

    json(data: any): PomResponse {
        this.body = JSON.stringify(data)
        this.contentType = "application/json"
        return this
    }

    text(body: string): PomResponse {
        this.body = body
        this.contentType = "text/plain"
        return this
    }

    status(code: number): PomResponse {
        this.code = code
        return this
    }

    header(key: string, value: string): PomResponse {
        this.headers = {
            ...this.headers,
            [key]: value
        }
        return this
    }

    build(): Response {
        return new Response(this.body, {
            status: this.code,
            headers: {
                "Content-Type": this.contentType,
                ...this.headers
            }
        })
    }
}