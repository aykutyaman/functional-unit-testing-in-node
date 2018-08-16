const express = require('express');
const Maybe = require('folktale/maybe');

const { Just, Nothing } = Maybe;

const app = express();

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
};

startServerIfCommandline(require.main, module, app, 3000);
