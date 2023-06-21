import express, { request } from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "http";
import compression from "compression";
import route from "./src/routes/routes"
import morgan from "morgan";

const app = express();


app.use(express.json())
app.use(compression());

app.use(cors({
    origin: '*'
}));


app.use(helmet());
app.use(express.json());
app.use(morgan("tiny"));
app.use("/", route);

const port = process.env.PORT;

let server = app.listen(port ?? 3010, function () {
    console.log(`⚡️[server]: Server is running at http://localhost:${port??3010}`);
});

function stop() {
    server.close();
}

module.exports = server;
module.exports.stop = stop;