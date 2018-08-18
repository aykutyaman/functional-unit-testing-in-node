const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const {
  stubTrue,
  stubFalse,
} = require('lodash/fp');

const { expect } = chai;
chai.use(chaiAsPromised);

const {
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
} = require('../src/server');


describe('src/server.js', () => {
  describe('howFly when called', () => {
    it('should return how fly', () => {
      expect(howFly()).to.equal('sooooooo fly');
    });
  });
  describe('startServerIfCommandline when called', () => {
    const mainStub = {};
    const appStub = { listen: () => 'net.Server' };
    it('should return a net.Server if commandline', () => {
      const result = startServerIfCommandline(mainStub, mainStub, appStub, 3000).getOrElse('&#x1f42e;');
      expect(result).to.equal('net.Server');
    });
    it('should return nothing if requiring', () => {
      const result = startServerIfCommandline(mainStub, {}, appStub, 3000).getOrElse('&#x1f42e;');
      expect(result).to.not.equal('net.Server');
    });
  });
  describe('legitFiles when called', () => {
    it('should work with an Array of 1', () => {
      expect(legitFiles(['cow'])).to.equal(true);
    });
    it('should fail with an Array of 0', () => {
      expect(legitFiles([])).to.equal(false);
    });
    it('should fail with popcorn', () => {
      expect(legitFiles('&#x1f37f;')).to.equal(false);
    });
  });
  describe('validFilesOnRequest when called', () => {
    it('should work with valid files on request', () => {
      expect(validFilesOnRequest({ files: ['cow'] })).to.equal(true);
    });
    it('should fail with empty files', () => {
      expect(validFilesOnRequest({ files: [] })).to.equal(false);
    });
    it('should fail with no files', () => {
      expect(validFilesOnRequest({})).to.equal(false);
    });
    it('should fail with piggy', () => {
      expect(validFilesOnRequest('&#x1f437;')).to.equal(false);
    });
  });
  describe('readEmailTemplate when called', () => {
    const readFile = (path, encoding, callback) => callback(undefined, 'email');
    const readFileBad = (path, encoding, callback) => callback(new Error('b00mz'));
    it('should read an email template file with good stubs', () => {
      return readEmailTemplate(readFile);
    });
    it('should read an email template called email', () => {
      return expect(readEmailTemplate(readFile)).to.become('email');
    });
    it('should fail if fails to read', () => {
      return expect(readEmailTemplate(readFileBad)).to.be.rejected;
    });
  });
  describe('getCannotReadEmailTemplateError when called', () => {
    it('should give you an error message', () => {
      expect(getCannotReadEmailTemplateError().message).to.equal('Cannot read email template');
    });
  });
  describe('filterCleanFiles when called', () => {
    it('should filter only clean files', () => {
      const result = filterCleanFiles([
        { scan: 'clean' },
        { scan: 'unknown' },
        { scan: 'clean' },
      ]);
      expect(result.length).to.equal(2);
    });
    it('should be empty if only whack files', () => {
      const result = filterCleanFiles([
        {},
        {},
        {},
      ]);
      expect(result.length).to.equal(0);
    });
    it('should be empty with no files', () => {
      const result = filterCleanFiles([]);
      expect(result.length).to.equal(0);
    });
  });
  describe('mapFilesToAttachments when called', () => {
    it('should work with good stubs for filename', () => {
      const result = mapFilesToAttachments([
        { originalname: 'cow' },
      ]);
      expect(result[0].filename).to.equal('cow');
    });
    it('should work with good stubs for path', () => {
      const result = mapFilesToAttachments([
        { path: 'of the righteous man' },
      ]);
      expect(result[0].path).to.equal('of the righteous man');
    });
    it('should have reasonable default filename', () => {
      const result = mapFilesToAttachments([{}]);
      expect(result[0].filename).to.equal('unknown originalname');
    });
    it('should have reasonable default path', () => {
      const result = mapFilesToAttachments([{}]);
      expect(result[0].path).to.equal('unknown path');
    });
  });
  describe('renderSafe when called', () => {
    it('should work with good stubs', () => {
      expect(renderSafe(() => 'cow', 'template', {}));
    });
    it('should render a cow', () => {
      expect(renderSafe(() => 'cow', 'template', {})).to.become('cow');
    });
    it('should fail if rendering blows up', () => {
      return expect(renderSafe(() => { throw new Error(); }, 'template', {})).to.be.rejected;
    });
  });
  describe('getEmailService when called', () => {
    // write `stubTrue` instead off `() => true`
    const configStub = { has: stubTrue, get: () => 'yup' };
    const configStubBad = { has: stubFalse };
    it('should work if config has defined value found', () => {
      expect(getEmailService(configStub).getOrElse('nope')).to.equal('yup');
    });
    it('should work if config has no defined value found', () => {
      expect(getEmailService(configStubBad).getOrElse('nope')).to.equal('nope');
    });
  });
  describe('createTransportObject object when called', () => {
    it('should create a host', () => {
      expect(createTransportObject('host', 'port').host).to.equal('host');
    });
    it('should crate a port', () => {
      expect(createTransportObject('host', 'port').port).to.equal('port');
    });
  });
  describe('createEmailOptions object when called', () => {
    it('should create a host', () => {
      expect(createEmailOptions('from', 'to', 'subject', 'html', []).from).to.equal('from');
    });
  });
  describe('getEmailServiceUnavailableError when called', () => {
    it('should create an error with a message', () => {
      const error = getEmailServiceUnavailableError();
      expect(error.message).to.equal('Email service unavailable');
    });
  });
  describe('createTransportMailer when called', () => {
    it('should work with good stubs', () => {
      expect(createTransportMailer(stubTrue, {})).to.equal(true);
    });
  });
  describe('sendEmailSafe when called', () => {
    const sendEmailStub = (options, callback) => callback(undefined, 'info');
    const sendEmailStubBad = (options, callback) => callback(new Error('dat boom'));
    it('should work with good stubs', () => {
      return expect(sendEmailSafe(sendEmailStub, {})).to.be.fulfilled;
    });
    it('should work with bad stubs', () => {
      return expect(sendEmailSafe(sendEmailStubBad, {})).to.be.rejected;
    });
  });
});
