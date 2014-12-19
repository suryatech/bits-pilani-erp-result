var request = require('request'),
    cheerio = require('cheerio'),
    config = require('./config.json'),
    log4js = require('log4js'),

    jar = request.jar(),
    loginURL = 'https://erp.bits-pilani.ac.in:4431/psp/hcsprod/?cmd=login&languageCd=ENG',
    gradeBookURL = 'https://erp.bits-pilani.ac.in:4431/psc/hcsprod/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_GRADE.GBL?ACAD_CAREER=0001&EMPLID=31120110480&INSTITUTION=BITS&STRM=1130',
    facebookURL = 'https://graph.facebook.com/',
    messageString = 'ARC has uploaded the grades of Semester 1, 2014-15 onto \
                    the ERP server. Click below to check your grades.\n\n\
                    Sent via ERP Result Notifier',
    ua = 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
    ssl = 'SSLv3_method',
    $ = '',
    handle = '',
    email = require('emailjs'),
    mailServer = email.server.connect({
        user: config.gmail_username,
        password: config.gmail_password,
        host: config.smtpServer,
        ssl: true
    }),
    mailMessage = {
        from: "ERP Result Notifier<" + config.gmail_username + ">",
        subject: "Semester 1, 2014-15 Grades",
        to: config.destination_email
    };

// Configure logger
log4js.configure({ 
    appenders: [
        {   
            type: 'file',
            filename: "./log",
            category: 'info',
            maxLogSize: 2048000,
            backups: 10
        }
    ]
});

var logger = log4js.getLogger('info');

// Send a pre-defined email to destination_email when the results are out.
var sendMail = function() {

    mailMessage.text = "Grades Updated.";

    mailServer.send(mailMessage, function(err, message) {
        if (err) {
            logger.error(err);
            logger.error("Error sending mail");
            return;
        }

        logger.info("Mail sent successfully");
    });
};

var postToFacebook = function() {

    facebookURL += config.group_id + '/feed?access_token=' + config.access_token
                + '&message=' + messageString + '&link=' + loginURL;

    request.post({
        url: facebookURL,
    }, function(e, r, data) {
        if (e) {
            logger.error("Request Failed", e);
            return;
        }

        data = JSON.parse(data);

        if (data.hasOwnProperty('id')) {
            logger.info("Successfully posted to facebook group");
        } else {
            logger.error("Error posting to group");
        }
    });
};

var login = function() {

    logger.info("Logging in...");
    request.post({

        url: loginURL,
        jar: jar,
        form: {
            userid: config.username,
            pwd: config.password
        },
        headers: {
            'User-Agent': ua
        },
        secureProtocol: ssl

    }, function(e, r, body) {
        if (e) {
            logger.error("Login Request Failed", e);
            return;
        }

        logger.info("Login Successful");
        handle = setInterval(checkGrade, config.interval);
    });
};

var checkGrade = function() {
    logger.info("Checking for grades...");
    request.post({
        url: gradeBookURL,
        jar: jar,
        headers: {
            'User-Agent': ua
        },
        secureProtocol: ssl
    }, function(e, r, body) {

        if (e) {
            logger.error("gradeCheck Request Failed", e);
            return;
        }

        $ = cheerio.load(body);
        
        // GPA Element
        var gpa = $("#STATS_ENRL\\$12").text().trim();

        if (gpa.length) {
            if (parseInt(gpa) > 0) {

                postToFacebook();
                sendMail();

                logger.info(gpa);
                logger.info("Result Declared");

                clearInterval(handle);
            }
        } else {
            logger.info("Not available yet");
        }
    });
};

login();
