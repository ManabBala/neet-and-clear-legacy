//Import express.js module and create its variable.
import express, { json, response } from "express";
import multer from "multer";
import { faker } from "@faker-js/faker";
import path from "path";

const app = express();

//Import PythonShell module.
import { PythonShell } from "python-shell";

//Define storage for the uploaded files
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./backend/uploads");
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + faker.string.nanoid(10) + path.extname(file.originalname));
	},
});

const upload = multer({ storage: storage });

//Router to handle the incoming request.
app.get("/", async function (req, res) {
	const result = { msg: "hello", error: 0 };
	res.json(result);
});

// file upload route
app.post("/upload", upload.single("file"), function (req, res) {
	const filePath = req.file.path;

	console.log(` filePath: ${filePath}\n `);
	res.json({ msg: "file uploaded", error: 0 });

	// TODO: processing the uploaded file further
});

const processUploadedFile = (URI) => {
	console.log("processing file: " + URI);

	// TODO: logic to check if its a valid image

	// TODO: cleanup the python OMR processing folders

	// TODO: move image to the python OMR input folder
};

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

//Creates the server on default port 8000 and can be accessed through localhost:8000
const port = 8000;
app.listen(port, () => console.log(`Server connected to ${port}`));
