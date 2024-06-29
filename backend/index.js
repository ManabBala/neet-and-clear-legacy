//Import express.js module and create its variable.
import express, { json, response } from "express";
const app = express();

//Import PythonShell module.
import { PythonShell } from "python-shell";

//Router to handle the incoming request.
app.get("/", (req, res, next) => {
	console.log("getting request");
});

// python script will be executed here
const runPythonScript = () => {
	let options = {
		pythonPath: "backend/utils/python/python_env/Scripts/python.exe",
		mode: "text",
		pythonOptions: ["-u"], // get print results in real-time
		scriptPath: "backend/utils/python/OMRChecker", //If you are having python_test.py script in same folder, then it's optional.
		args: [
			"-i",
			"backend/utils/python/storage/inputs/",
			"-o",
			"backend/utils/python/storage/outputs/",
		], //An argument which can be accessed in the script using sys.argv[1]
	};

	let pyshell = new PythonShell("main.py", options);

	// sends a message to the Python script via stdin
	// pyshell.send({ name: "Manab", age: 24 });

	pyshell.on("message", function (message) {
		// received a message sent from the Python script (a simple "print" statement)
		// try {
		// 	if (!(message.search("Booklet_No") === -1)) {
		// 		message = message.replace(/'/g, '"');
		// 		let responseData = JSON.parse(message);
		// 		console.log(responseData);
		// 	}
		// } catch (error) {
		// 	console.log(error);
		// }
		console.log("[Python]", message);
	});

	// end the input stream and allow the process to exit
	pyshell.end(function (err, code, signal) {
		if (err) throw err;
		console.log("The exit code was: " + code);
	});
};

runPythonScript();

//Creates the server on default port 8000 and can be accessed through localhost:8000
const port = 8000;
app.listen(port, () => console.log(`Server connected to ${port}`));
