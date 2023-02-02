const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

//read jason file
const tours = JSON.parse (fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8'));

// import data into database

const importData = async () => {
	try {
	  await Tour.create(tours)
	  console.log ('Data succesufuly loaded');
	} catch (err) {
	    console.log (err);
	};
};

// delete all data from db collection
const deleteData = async () => {
	try {
		await Tour.deleteMany();
		console.log ('Data succesufuly deleted');
	  } catch (err) {
		  console.log (err);
	  };
	process.exit();
};
if (process.argv[2] === '--import') {
	importData();
}else if (process.argv[2] === '--delete') {
	deleteData();
};