# BITS Pilani ERP Result #
Poll the BITS Pilani ERP server for semester results and send an email when they are out.
### Usage

 - `npm install` once you are in the root directory of the project
 
 - Edit the `config.json` file
	  - `access_token:` Add a valid FB access token to post on a facebook group (optional)
	  - `gmail_username/gmail_password`: Add a gmail username and password to send an email
	  - `destination_email`: Add a destination email to receive the email when the results are out
	  - `smtpServer`: Mail Server to use
	  - `group_id`: FB group to publish a message
	  - `username`: ERP username
	  - `password:` ERP Password
	  - `interval`: Check for the results after every x milliseconds. (The session cookies expire after about 5 minutes. It is not a very good idea to login every 5 minutes to check the result. Set it to a value < 5 minutes to avoid logging in every single time)

 - Edit the `index.js` file
	  - `userid`: Numeric ID corresponding to the username field in config.json. For ex: 31120110XXX, for username: 2011C6PSXXXG.
	  - `term`: Semester ID. This can be found in the grades section in your account.
	  - Edit the facebook post message and the email text as required.
	  
 - Set the `log4js` output file

 - `node index.js`

####Modules Used

 - [Cheerio](https://github.com/cheeriojs/cheerio): Required for parsing   the HTML response.  
 - [Request](https://github.com/request/request): Most popular HTTP(S) module for Node.js
 - [Log4js](https://github.com/nomiddlename/log4js-node): Log messages with their timestamps
 - [emailjs](https://github.com/eleith/emailjs): Required for sending an email when the results are out
 - [Facebook Graph API](https://developers.facebook.com/docs/graph-api): Required for publishing a post when   the results are declared
