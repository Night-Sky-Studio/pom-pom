import Bun from "bun"
import pkg from "@/package.json"

Bun.serve({
    port: 5100,
    routes: {
        "/": {
            GET: (req) => {
                return new Response(`Inter-knot data server. Version ${pkg.version}`)
            }
        },
        "/:id": {
            GET: (req) => {
                const { id } = req.params
                return new Response(`You requested ID: ${id}`)
            }
        }
    }
})