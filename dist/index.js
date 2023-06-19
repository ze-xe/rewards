"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const compression_1 = __importDefault(require("compression"));
// import route from "./src/routes/apiRoute";
const morgan_1 = __importDefault(require("morgan"));
const merkleTree_1 = require("./merkleTree");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
app.use((0, compression_1.default)());
// require("dotenv").config();
app.use((0, cors_1.default)({
    origin: '*'
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)("tiny"));
// app.use("/", route);
const m = new merkleTree_1.MerkleTree(["a", "b", "c"]);
console.log(m);
const port = process.env.PORT;
let server = httpServer.listen(port !== null && port !== void 0 ? port : 3010, function () {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
function stop() {
    server.close();
}
module.exports = server;
module.exports.stop = stop;
