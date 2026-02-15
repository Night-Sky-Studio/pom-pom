export class PomOptions {
    defaultHeaders: Map<string, string>

    constructor(options: Partial<PomOptions> = {}) {
        this.defaultHeaders = options.defaultHeaders || new Map()
        this.defaultHeaders.set('X-Powered-By', 'Pom-Pom')
    }
}