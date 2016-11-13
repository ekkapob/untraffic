const Request = require('request');
const Nodemailer = require('nodemailer');

const MAP_KEY = require('./map_info').KEY;
const MAP_ORIGIN = require('./map_info').ORIGIN;
const MAP_DESTINATION = require('./map_info').DESTINATION;

const EMAIL_CREDENTIALS = require('./email_info').CREDENTIALS;
const EMAIL_FROM = require('./email_info').FROM;
const EMAIL_CONTACTS = require('./email_info').CONTACTS;
const EMAIL_CONTENT = require('./email_info').CONTENT;
const EMAIL_SUBJECT = require('./email_info').SUBJECT;

const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${MAP_ORIGIN}&destination=${MAP_DESTINATION}&mode=driving&traffic_model=best_guess&departure_time=now&key=${MAP_KEY}`;

function run(emailFunc) {
  Request(url, (error, response, body) => {
    if (error) return run(emailFunc);

    const json = JSON.parse(body)
    const leg = json.routes[0].legs[0];
    console.log(leg.duration_in_traffic.text);
    emailFunc(leg.duration_in_traffic.text);
  });
}

function mail(durationTxt){
  var transporter = Nodemailer.createTransport(EMAIL_CREDENTIALS);
  const duration = formatDuration(durationTxt);
  const timeNowText = timeNow();
  let content = EMAIL_CONTENT.replace('{{duration}}', duration);
  content = content.replace('{{timeNow}}', timeNowText);

  var mailOptions = {
      from: EMAIL_FROM,
      to: EMAIL_CONTACTS,
      subject: EMAIL_SUBJECT,
      text: content,
      html: content
  };

  transporter.sendMail(mailOptions, function(error, info){
    if(error) return console.log(error);
    console.log('Message sent: ' + info.response);
  });
}

function formatDuration(text) {
  text = text.replace(/hours/, 'ชม.');
  return text.replace(/mins/, 'นาที');
}

function timeNow() {
  const time = new Date();
  const mins = time.getMinutes();
  let minsText = (mins < 10)? ('0' + mins): mins;
  return `${time.getHours()}:${minsText}`;
}

run(mail);
