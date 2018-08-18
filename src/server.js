const express = require('express');
const Maybe = require('folktale/maybe');
const {
  get,
  getOr,
  filter,
  map,
  curry,
} = require('lodash/fp');
const { Just, Nothing } = Maybe;

const app = express();

const legitFiles = files => Array.isArray(files) && files.length > 0;
const validFilesOnRequest = req => legitFiles(get('files', req));
const getCannotReadEmailTemplateError = () => new Error('Cannot read email template');
const readEmailTemplate = readFile => (
  new Promise((resolve, reject) => (
    readFile('./templates/email.html', 'utf-8', (error, template) => (
      error
        ? reject(getCannotReadEmailTemplateError())
        : resolve(template)))))
);
const filterCleanFiles = filter( // filter is curried
  file => get('scan', file) === 'clean'
);
const mapFilesToAttachments = map(
  file => ({
    filename: getOr('unknown originalname', 'originalname', file),
    path: getOr('unknown path', 'path', file),
  })
);
const renderSafe = curry((renderFunction, template, value) => (
  new Promise(resolve => resolve(renderFunction(template, value)))
));
const getEmailService = config => (
  config.has('emailService')
    ? Just(config.get('emailService'))
    : Nothing()
);
const createTransportObject = (host, port) => ({
  host,
  port,
  secure: false,
});
const createEmailOptions = (from, to, subject, html, attachments) => ({
  from,
  to,
  subject,
  html,
  attachments,
});
const getEmailServiceUnavailableError = () => (
  new Error('Email service unavailable')
);
const createTransportMailer = curry((createTransportFunction, transportObject) => (
  createTransportFunction(transportObject)
));
const sendEmailSafe = curry((sendEmailFunction, mailOptions) => (
  new Promise((resolve, reject) => (
    sendEmailFunction(mailOptions, (error, info) => (
      error ? reject(error) : resolve(info)
    ))
  ))
));

const mainIsModule = (module, main) => main === module;

const startServerIfCommandline = (main, module, app, port) => (
  mainIsModule(main, module)
    ? Just(app.listen(port, () => console.log('Example app listening on port 3000')))
    : Nothing()
);

const howFly = () => 'sooooooo fly';

module.exports = {
  howFly,
  startServerIfCommandline,
  legitFiles,
  validFilesOnRequest,
  readEmailTemplate,
  getCannotReadEmailTemplateError,
  filterCleanFiles,
  mapFilesToAttachments,
  renderSafe,
  getEmailService,
  createTransportObject,
  createEmailOptions,
  getEmailServiceUnavailableError,
  createTransportMailer,
  sendEmailSafe,
};

startServerIfCommandline(require.main, module, app, 3000);
