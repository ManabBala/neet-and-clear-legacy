//Import express.js module and create its variable.
import express from "express";
const app = express();

console.log("Hello from Server!😊");

//Router to handle the incoming request.
app.get("/", (req, res, next) => {
	console.log("getting request");
});

//Creates the server on default port 8000 and can be accessed through localhost:8000
const port = 8000;
app.listen(port, () => console.log(`Server connected to ${port}`));
