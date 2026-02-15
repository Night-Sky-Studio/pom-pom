<div align="center">
    <img src="docs/pom-pom.webp" alt="PomPom Logo" width="150" />
    <h1>PomPom</h1>
    <p>Express-like wrapper around <code>Bun.serve</code></p>
    <sub>Our little Express' Conductor</sub>
</div>

## Disclaimer
This project will not work in Node.js, it's built specifically for Bun. If you want an Express-like framework for Node.js, consider using Express itself or Fastify.

## Installation
```sh
bun install @interknot/pom-pom
```

## Usage
Use it exactly as you would use Express.js.
```ts
import { PomPom, PomResponse } from "@interknot/pom-pom"

const app = new PomPom()

app.get("/hello", (req, res) => {
    return res.text("Hello, world!")
})

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000")
})
```

## Middlewares
Supported middlewares: `cors`
```ts
import { cors } from "@interknot/pom-pom/middleware"

app.use(cors({
    origin: "https://example.com"
}))
```

## Router
PomPom includes a file-system based router that follows Next.js style routing.
```ts
import { PomPom, registerRoutes } from "@interknot/pom-pom"

const app = new PomPom()

registerRoutes(app, "./routes")
```
### Example directory structure
```
/routes
  /api
    /users
      [id].ts         --> /api/users/:id
      index.ts        --> /api/users
    index.ts          --> /api
    /about.ts         --> /about
    index.ts          --> /
```

### Example route handler file
Supported HTTP methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`
```ts
// /routes/api/users/[id].ts
import type { PomRequest, PomResponse } from "@interknot/pom-pom"

export async function get(req: PomRequest, res: PomResponse) {
    const userId = req.params.id
    return res.json({ id: userId, name: "User " + userId })
}

export async function post(req: PomRequest, res: PomResponse) {
    const userData = await req.json()
    // Process userData...
    return res.json({ success: true, data: userData })
}

export async function put(req: PomRequest, res: PomResponse) {
    const userData = await req.json()
    // Update userData...
    return res.json({ success: true, data: userData })
}

// Note: 'delete' is a reserved keyword in JavaScript/TypeScript, 
// so we use '_delete' instead
export async function _delete(req: PomRequest, res: PomResponse) {
    const userId = req.params.id
    // Delete user...
    return res.json({ success: true, id: userId })
}

export async function patch(req: PomRequest, res: PomResponse) {
    const userData = await req.json()
    // Partially update userData...
    return res.json({ success: true, data: userData })
}
```

## Performance
PomPom is designed to be lightweight and fast. It adds minimal overhead
over `Bun.serve`, making it suitable for high-performance applications.

From my testing, the overhead it around 10-25%, depending on the complexity of the routes and middlewares used. Still faster than Express, though!

### Benchmarks
I've used Bombardier for benchmarking, the command is the same everywhere.
```sh
❯ bombardier -n 1000000 -c 1000 "http://localhost:5100/"
```
#### PomPom
```sh
Statistics        Avg      Stdev        Max
  Reqs/sec     81866.28    4143.86   98144.69
  Latency       12.21ms     2.40ms   160.95ms
  HTTP codes:
    1xx - 0, 2xx - 1000000, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:    16.16MB/s
```

#### Bun.serve
```sh
Statistics        Avg      Stdev        Max
  Reqs/sec     94794.96    5274.28  108950.55
  Latency       10.55ms     3.69ms   249.50ms
  HTTP codes:
    1xx - 0, 2xx - 1000000, 3xx - 0, 4xx - 0, 5xx - 0
    others - 0
  Throughput:    19.97MB/s
```

## License
```
Copyright 2026 Night Sky Studio (Konstantin Romanets)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```