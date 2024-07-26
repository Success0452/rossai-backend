import App from "./app"
import AiRoute from "./routes/ai.route"

const app = new App([
    new AiRoute()
])

app.listen()
