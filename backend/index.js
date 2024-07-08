//Import express.js module and create its variable.
import express, { json, response } from "express";
import multer from "multer";
import { faker } from "@faker-js/faker";
import path from "path";
import fse from "fs-extra";

const app = express();

//Import PythonShell module.
import { PythonShell } from "python-shell";

//Define storage for the uploaded files
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./backend/uploads");
	},
	filename: function (req, file, cb) {
		cb(null, faker.string.nanoid(10) + path.extname(file.originalname));
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
	const fileName = req.file.filename;
	console.log(`File(${fileName}) uploaded to ${filePath}`);

	res.json({ msg: "file uploaded", error: 0 });

	// processing the uploaded file further
	processUploadedFile(fileName, filePath);
});

const processUploadedFile = (fileName, URI) => {
	console.log("processing file: " + URI);

	// TODO: logic to check if its a valid image

	// TODO: cleanup the python OMR processing folders

	// copy image to the python OMR input folder
	let srcPath = URI;
	let destPath = "./backend/utils/python/storage/inputs/" + fileName;
	try {
		fse.copySync(srcPath, destPath, { overwrite: true }); // overwrite if already exists
		console.log("successfully copy file from " + srcPath + " to " + destPath);

		// run the python script
		runPythonScript()
			.then(() => {
				console.log("Python Script Executed Successfully");

				// TODO: check if results are valid or something..

				console.log("Starting processing results");
				// process the results from the python script
				processResults(fileName, URI);
			})
			.catch((err) => {
				console.error(err);
			});
	} catch (err) {
		console.error(err);
	}
};

const processResults = (fileName, URI) => {
	console.log("processing results");
	// making omr storage folder with the name of the image by faker
	let omrResultStoragePath = "./backend/storage/" + path.parse(URI).name;
	fse.ensureDirSync(omrResultStoragePath);

	// move omr to the storage folder
	let srcPath = "./backend/utils/python/storage/inputs/" + fileName;
	let destPath = omrResultStoragePath + "/OMR.jpg";
	try {
		fse.moveSync(srcPath, destPath, { overwrite: true }); // overwrite if already exists
		console.log("successfully moved OMR from " + srcPath + " to " + destPath);
	} catch (err) {
		console.error(err);
	}

	// move checkedOMR to the storage folder
	srcPath = "./backend/utils/python/storage/outputs/CheckedOMRs/" + fileName;
	destPath = omrResultStoragePath + "/checkedOMR.jpg";
	try {
		fse.moveSync(srcPath, destPath, { overwrite: true }); // overwrite if already exists
		console.log("successfully moved checkedOMR from " + srcPath + " to " + destPath);
	} catch (err) {
		console.error(err);
	}

	// find all the csv files in the output/Results folder
	let resultsFileName = "";
	let directoryPath = "./backend/utils/python/storage/outputs/Results";
	try {
		const files = fse.readdirSync(directoryPath);
		if (!Array.isArray(files)) {
			console.log(files);
			return console.error("Expected files to be an array, but got:", typeof files);
		}
		const csvFiles = files.filter((file) => path.extname(file).toLowerCase() === ".csv");
		console.log("CSV files:", csvFiles);

		// TODO: need proper way to select the latest csv file
		resultsFileName = csvFiles[0];
	} catch (err) {
		console.error("Unable to scan directory:", err);
	}

	// move results.csv to the storage folder
	srcPath = "./backend/utils/python/storage/outputs/Results/" + resultsFileName;
	destPath = omrResultStoragePath + "/result.csv";
	try {
		fse.moveSync(srcPath, destPath, { overwrite: true }); // overwrite if already exists
		console.log("successfully moved results.csv from " + srcPath + " to " + destPath);
	} catch (err) {
		console.error(err);
	}
};

// python script will be executed here
const runPythonScript = () => {
	return new Promise((resolve, reject) => {
		console.log("Running python script...");
		let options = {
			pythonPath: "backend/utils/python/OMRChecker/venv/Scripts/python.exe",
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
			console.log("[Python]", message);
		});

		// end the input stream and allow the process to exit
		pyshell.end(function (err, code, signal) {
			console.log("The exit code was: " + code);
			if (err) reject(err);
			// resolve the promise
			resolve();
		});
	});
};

//Creates the server on default port 8000 and can be accessed through localhost:8000
const port = 8000;
app.listen(port, () => console.log(`Server connected to ${port}`));
