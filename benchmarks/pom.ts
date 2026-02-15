import { PomPom, PomRequest } from "@/server"
import pkg from "@/package.json"

const app = new PomPom()

app.get("/", (_, res) => {
    return res.text(`Inter-knot data server. Version ${pkg.version}`)
})
app.get("/:id", (req, res) => {
    const { id } = req.params
    return res.text(`You requested ID: ${id}`)
})

app.listen(5100, () => {
    console.log(`Server is running on port 5100`)
})