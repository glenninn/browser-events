# BlueJeans Browser Meeting Event Monitor

![BlueJeans](./media/927.png)



Reference Design for Monitoring BlueJeans Meeting Events from a Web Page

- 8/21/2019,g1, Initial creation

This set of Javascript application files demonstrates how to connect and to the Event stream from a BlueJeans meeting.  It is intended for **reference only** and no guarantee of quality of accuracy is given.

The design consist of 2 Javascript files and both require the npm myclass package.

<script src='my.class.min.js'></script>
<script src='browserevents.js'></script>
<script src='roster.js'></script>
## Prerequisites

As this reference application makes BlueJeans API calls from a client browser session, the host which serves the HTML/JS code must be whitelisted by BlueJeans.  

*Alternatively* many browser support extensions that can be used to disable the CORS security policy and thus allowing a developer to test their code.



### To Install
1. Download the files from this git repository into either a local directory, or onto a web server.
2. Browse to the example web page at:   http://<your location>/index.html



## To Run

When the application web page comes up, it will appear approximately as shown:

![](/media/screenshot.png)



You must connect to a valid BlueJeans Meeting using the provided controls on the page:  Upon connection, the application will display a JSON object that contains connection settings, and then shortly thereafter begin displaying a table of participants and their corresponding Meeting Roster values.  

For detailed explanation of the **highly-abbreviated** field names, refer to the BlueJeans Developer SDK for Events at [https://github.com/bluejeans/api-events-meetings](https://github.com/bluejeans/api-events-meetings)




