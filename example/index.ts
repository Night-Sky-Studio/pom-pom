import { PomPom, PomRequest, PomResponse } from "../src"

const app = new PomPom()

app.get("/hello", (req, res) => {
    return res.text("Hello, world!")
})

app.get("/user/:id?name&age&gender", (req, res) => {
    // Params and Query are destructured from url
    // Fully typed and autocompleted in IDEs
    const { id } = req.params
    const { name, age, gender } = req.query

    return res.json({ id, name, age, gender })
})

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000")
})