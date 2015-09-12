#!/usr/bin/env node

/* jshint browser: true */

/* *******************************************
 * .ics File Update
 * by John M. Wargo
 * www.johnwargo.com
 ********************************************/
//TODO: allow debug mode to be enabled on the command line
var blankStr = '';
var helpFile = 'help.txt';
var meetingFileOut = 'meeting.ics';
var theStars = "***************************************";

//External modules we're using
var colors = require('colors');
var exec = require('child_process').exec;
var fs = require('fs');
var os = require('os');
var path = require('path');
//var sys = require('sys');
var uid = require('node-uuid');

colors.setTheme({
  info: 'grey',
  help: 'green',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

//----------------------------------------------------------------------
// Dispaly the help file
//----------------------------------------------------------------------
function displayHelp() {
  //Then display the help file contents
  var raw = fs.readFileSync(path.join(__dirname, helpFile)).toString('utf8');
  console.log(raw);
  console.log();
  process.exit(1);
}

//----------------------------------------------------------------------
// List command line arguments to the console
//----------------------------------------------------------------------
function listArgs() {
  //Get the command arguments
  var userArgs = process.argv;
  //Do we have any?
  var numArgs = userArgs.length;
  if (numArgs > 0) {
    console.log("Command line arguments");
    //Then write them to the console
    for (var i = 0; i < numArgs; i++) {
      console.log(i + ": " + userArgs[i]);
    }
    console.log();
  }
}

//----------------------------------------------------------------------
// doLog
// Write to the console, only if debugMode is enabled (true)
//----------------------------------------------------------------------
var debugMode = false;
//----------------------------------------------------------------------
function doLog(msgText) {
  if (debugMode) {
    console.log(msgText);
  }
}

//----------------------------------------------------------------------
// Left pad a string to the specified size
//----------------------------------------------------------------------
function pad(num, size) {
  var s = num + blankStr;
  while (s.length < size) s = "0" + s;
  return s;
}

//----------------------------------------------------------------------
// Determine the user's home folder, varies per OS.
//----------------------------------------------------------------------
function getHomefolder() {
  var home_folder;
  //Get the environment variables for the system
  var theEnv = process.env;
  doLog("Getting home folder location");
  //The home folder variable varies per OS
  if (isWindows) {
    doLog("Running on Windows");
    //Set the default home folder for Windows
    home_folder = theEnv.USERPROFILE;
  } else {
    doLog("Runnning on a Linux variant");
    //Home folder for OS X and Linux
    home_folder = theEnv.HOME;
  }
  //Do we have a value?
  if (home_folder.length > 0) {
    //Return the home folder
    return home_folder;
  } else {
    console.error("Unable to determine home folder".error);
    process.exit(1);
  }
}

//----------------------------------------------------------------------
// Process the ICS File
// Update information in the ICS file for the current appointment
//----------------------------------------------------------------------
function processICSFile(icsFilePath) {

  var colon = ':';
  var theDate = new Date();
  var endDate, homeFolder, startDate, theTimeStr, theDateStr, theTimeStampStr, theUID, timeZone;

  //--------------------------------------------------------------------
  //Locate the array item that begins with the specified string, we'll
  //replace the whole line later.
  //--------------------------------------------------------------------
  function getIndex(theLines, searchStr) {
    var numLines = theLines.length;
    if (numLines > 0) {
      //Do we even have lines?
      for (var i = 0; i < numLines; i++) {
        //Does the line contain the serch string in the first position?
        if (theLines[i].search(searchStr) === 0) {
          //yes? Then we have a match
          return i;
        }
      }
      //We didn't find one, so return -1
      return -1;
    } else {
      //no lines to search
      return -1;
    }
  }

  //--------------------------------------------------------------------
  //Find the search string in the list and replace it with a new line
  //--------------------------------------------------------------------
  function updateList(theLines, searchStr, newVal) {
    var theIndex = getIndex(theLines, searchStr);
    //Were we able to find it?
    if (theIndex > -1) {
      //Update the line from the file
      theLines[theIndex] = newVal + "\n";
    } else {
      console.log("\nUnable to locate meeting value %s\n".error, searchStr);
      process.exit(1);
    }
  }

  //--------------------------------------------------------------------
  //Get the time zone for the appointment from the existing ICS file
  //--------------------------------------------------------------------
  function getTimeZone(theLines) {
    var theIndex = getIndex(theLines, "TZID:");
    //Were we able to find it?
    if (theIndex > -1) {
      //Get the line from the file
      var tmpStr = theLines[theIndex];
      //Get everything past the search string
      return tmpStr.substr(5, 99).trim();
    } else {
      console.log("\nUnable to determine meeting time zone\n".error);
      process.exit(1);
    }
  }

  //--------------------------------------------------------------------
  //here's where we start working with the .ics file
  //--------------------------------------------------------------------
  //get the user's home folder path
  homeFolder = getHomefolder();
  console.log("Home folder: %s", homeFolder);

  //Resolve the file path to an absolute path
  var sourceFile = path.normalize(icsFilePath);

  //Get the ics file name
  var icsFileName = path.basename(sourceFile);
  //Check to see if we just got a file name, if so, add home folder to it
  if (icsFileName == sourceFile) {
    //Build the target folder using the user's home folder
    sourceFile = path.join(homeFolder, icsFileName);
  }
  //Tell the user what file we're going to be updating
  console.log("Source file: %s", sourceFile);

  //Figure out the output file path
  var outputFile = path.join(homeFolder, meetingFileOut);
  //Tell the user where we're writing the output file
  console.log("Output file: %s", outputFile);

  //Make sure the file actually exists
  if (!fs.existsSync(sourceFile)) {
    //the file doesn't exist, so we can't use it
    console.log("\nSpecified file (%s) does not exist\n".error, sourceFile);
    process.exit(1);
  }

  console.log("Target .ics file: %s", icsFileName);
  //Make sure we actually have a ,ics file to work with
  if (path.extname(icsFileName) !== '.ics') {
    console.log("\nCannot process file, '%s' is not an .ics file\n".error, icsFileName);
    process.exit(1);
  }

  //=================================================================
  //Read the file
  //=================================================================
  console.log('Reading .ics file');
  //Read the file, parse each line into an array
  var theLines = fs.readFileSync(sourceFile).toString().split("\n");

  //Now that we have the .ics file, use it to determine the meeting time zone
  timeZone = getTimeZone(theLines);
  console.log("Time zone: '%s'", timeZone);

  //=================================================================
  //Replace the stuff we need to replace in the .ics file
  //=================================================================
  console.log('Updating .ics file contents');

  //First do the meeting start date/time
  theDateStr = theDate.getFullYear() + pad(theDate.getMonth() + 1, 2) + pad(theDate.getDate(), 2);
  theTimeStr = 'T' + pad(theDate.getHours(), 2) + '0000';
  //DTSTART;TZID=America/New_York:20140307T120000
  startDate = 'DTSTART;TZID=' + timeZone + colon + theDateStr + theTimeStr;
  console.log('Meeting Start: %s', startDate);
  updateList(theLines, "DTSTART;", startDate);

  //Next do the meeting end date/time
  theTimeStr = 'T' + pad(theDate.getHours() + 1, 2) + '0000';
  //DTEND;TZID=America/New_York:20140307T130000
  endDate = 'DTEND;TZID=' + timeZone + colon + theDateStr + theTimeStr;
  console.log('Meeting End: %s', endDate);
  updateList(theLines, "DTEND;", endDate);

  //Data/Time stamp (whatever that is)
  //DTSTAMP:20140314T100000Z
  theTimeStampStr = 'DTSTAMP:' + theDateStr + theTimeStr + 'Z';
  console.log('Timestamp: %s', theTimeStampStr);
  updateList(theLines, "DTSTAMP:", theTimeStampStr);

  //Finally the unique identifier for the meeting request
  //Allows us to use to use the same file over and over again to generate
  //a 'new' meeting every time
  //UID:B1120E2C-E115-469F-9042-F5505615F079
  theUID = 'UID:' + uid.v1().toUpperCase();
  console.log('GUID: %s', theUID);
  updateList(theLines, "UID:", theUID);

  //=================================================================
  //Write the changes back to disk
  //=================================================================
  console.log("Writing to %s", outputFile);

  //First, write out the first line of the file
  fs.writeFileSync(outputFile, theLines[0]);
  //Then append the contents of the ics file to the output file
  var numLines = theLines.length;
  for (var i = 1; i < numLines; i++) {
    //Now append the rest of the file
    fs.appendFileSync(outputFile, theLines[i]);
  }
  //Mark the file as having been processed by this script
  fs.appendFileSync(outputFile, "Note: .ics file created by ics-update (https://github.com/johnwargo/ics-update)");

  //=================================================================
  // Now launch the .ics file we just updated
  //=================================================================
  console.log("Launching %s", outputFile);  
  var cmdStr;
  if (isWindows) {
    cmdStr = "start " + outputFile;
  } else {
    cmdStr = "open " + outputFile;
  }
  console.log("Launch command: '%s'", cmdStr);
  var child;
  //Todo: figure out how to do this synchronously so the "All Done" message doesnt' appear on failure
  child = exec(cmdStr, function (error, stdout, stderr) {
    if (error !== null) {
      console.log("\nexec error: %s\n".error, error);
      process.exit(1);
    }
  });
}

//=================================================================
//Here's where we start doing stuff...
//=================================================================
//Write out what we're running
console.log("\n%s".help, theStars);
console.log(" .ics File Update".help);
console.log(theStars.help);

if (debugMode) {
  console.log("Debug mode is enabled\n".help);
  //Write the argument list to the console
  listArgs();
}

//Are we running on Windows? It matters for some things
var isWindows = (os.type().indexOf('Win') === 0);

//=================================================================
//First lets sort out the command line arguments
//=================================================================
var userArgs;
//Is the first item 'node'? then we're testing or running under node V4 or higher
if (process.argv[0].toLowerCase() === 'node' || process.argv[0].indexOf('node.exe') > -1) {
  //whack the first two items off of the list of arguments
  //This removes the node entry as well as the module name entry (the
  //program we're running)
  userArgs = process.argv.slice(2);
} else {
  //whack the first item off of the list of arguments
  //This removes just the module name entry
  userArgs = process.argv.slice(1);
}
//now parse the command line options
var numArgs = userArgs.length;
if (numArgs > 0) {
  //First parameter is the file path we need
  processICSFile(userArgs[0]);
} else {
  //Missing command line arguments
  console.log("\nMissing command-line argument(s)\n".error);
  displayHelp();
}

//========================================================================
// Finished - if we got this far, it must have worked
//========================================================================
console.log(theStars.help);
console.log("All done!".help);
console.log(theStars.help);
console.log();