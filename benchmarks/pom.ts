import { PomPom, PomRequest, PomResponse } from "@/src"
import pkg from "@/package.json"

const app = new PomPom()

app.get("/", (_: PomRequest, res: PomResponse) => {
    return res.text(`Test server. Version ${pkg.version}`)
})
app.get("/:id", (req: PomRequest, res: PomResponse) => {
    const { id } = req.params
    return res.text(`You requested ID: ${id}`)
})

app.listen(5100, () => {
    console.log(`Server is running on port 5100`)
})