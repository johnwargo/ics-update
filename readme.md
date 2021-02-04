.ics File Update
====================

This is a simple node module that updates a simple calendar entry file (an .ics file) with the current date then launches it. The purpose of this module is to provide users with an easy way to populate a meeting invite, export it to a .ics file then use the module to prepare it for reuse for creating subsequent meeting requests.

Many sales people and other professionals regularly invite team members, customers or partners to conference calls or online meetings. While there are often email client plugins that automate some of this process, most users store their conference information (dial-up, URL) somewhere (perhaps in a text file or as a contact in their address book). When they create a new meeting invitation, they'll open the stored conference information and copy and paste it into the new meeting request. This can become quite tedious, especially if you complete these steps on a regular basis.

A longtime friend and colleague recently asked me to create a process he could use to take a pre-populated meeting invitation (one that had his conference dial-up and so on already populated in the body of the meeting request) and update it with the current date (and future time) then open it so he could easily add the meeting subject, adjust the meeting time and invite participants. I could have made a native application or a email client plugin, but it would be hard to deliver a cross-platform solution or one that didn't leave out popular email clients. 

I'd been working a bit with NodeJS and wanted to create (and publish) a node module, so I decided to make this thing using NodeJS. It should work on Windows, but I have not tested it (yet).

How it Works
====================
The module takes an existing iCalendar (.ics) file, updates it and uses the system's shell to launch it using the default application. This allows users to send the meeting request using their default calendar client. The [iCalendar file](http://en.wikipedia.org/wiki/ICalendar) is essentially just a text file, you can make your own or export one from your existing calendar program. 

Create an appointment, populate the subject, body fields plus any other ones you want pre-populated then export it as an .ics file to your system's local hard drive. I recommend putting it in your Documents or Home folder.

Once you have the .ics file, execute the ics-update command and pass it a path pointing to the .ics file you saved. The program will read the file, update the existing meeting request to point to the current date and adjust the time to two hours (rounded) from the current time then launch it using the system's default calendar program.

Once launched, the meeting request will open in edit mode - you should then adjust the subject as needed, add participants and change the date and time to the correct value for your meeting and send the invitation out. 

That's it.

In reality, I don't expect that you will want to regularly open a terminal window to make a meeting invite, so what my colleague did was use the Macintosh OS X Automator program to make an application or a service you can launch to execute the command (with the appropriate .ics file path and so on). This makes it easier (and more visual) to execute this when needed. On Windows, once I've confirmed this will work on Windows, you can easily craft a batch file that launches the module with the appropriate command line parameter(s).

What this approach supports is the ability to create multiple shortcuts or services that each 'launches' a different meeting invite. Then you could have one for phone calls, another for online meetings, or one for internal or another for external meetings. Consultants who support multiple customers, could have a separate ics file for each dial-in service used by their customers.


Installation
====================
Install this module using npm by opening a terminal window and executing the following command:

Windows:

	npm install -g ics-update

Macintosh OS X:

	sudo npm install -g ics-update

If you've downloaded this module's code from GitHub, you can install the module by extracting the files then opening a terminal window and navigating to the folder where this file is located and issuing the following command:

Windows:

	npm install -g

Macintosh OS X:

	sudo npm install -g

That's it, that's all there is to installing the module.

Usage
====================
To use the module, open a terminal window and execute the following command:

    ics-update path_to_ics_file

The path_to_ics_file is a parameter that specifies a file path to a valid .ics file. For example, if the .ics file was a file called call.ics located in the user's Documents folder, you could process the file using the following command:

    ics-update /Users/user_name/Documents/call.ics
    
The file path pointing to the .ics file can be absolute or relative, the following work as well:

    ics-update ../test/call.ics
    
if the .ics file is in the user's home folder, you can simply pass the file name to the call to make-ics:

    ics-update ics_file_name.ics

When the module sees that it only has a file name, it builds a full path using the home folder and looks for the file there.

Known Limitations
=================
I wasn't able to get exec to operate synchronously, so at the very end of the script, when it's launching the .ics file, you may see the All Done message before any shell errors appear. It looks like a future version of Node will be adding synchronous exec, so I'll 'fix' this then.

***

You can find information on many different topics on my [personal blog](http://www.johnwargo.com). Learn about all of my publications at [John Wargo Books](http://www.johnwargobooks.com).

If you find this code useful and feel like thanking me for providing it, please consider <a href="https://www.buymeacoffee.com/johnwargo" target="_blank">Buying Me a Coffee</a>, or making a purchase from [my Amazon Wish List](https://amzn.com/w/1WI6AAUKPT5P9).
