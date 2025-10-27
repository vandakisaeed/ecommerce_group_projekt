// Allowed access from all IP's currentlly because of mobile Hotspot

// single file for Db Connectin details
import mongoose from "mongoose";

// try catch block around db connection
try {
	// check for variale first because of typescript
	if (process.env.DBConnectionString) {
		// await establish connection with env variable
		await mongoose.connect(process.env.DBConnectionString);
		// log succesfully connection to console
		console.log("Mongo DB connection established");
	} else {
		// no Connection string == Error
		throw new Error("No Db Connection string provided in .env file.");
	}
} catch (error) {
	// catch occuring errors
	console.error("MongoDB connection error: ", error);
}
// export whole thing
// no need to store in variable or anything else
export {};
