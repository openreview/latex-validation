## LaTex Validation
Utilities to validate the syntax of Latex fragments.

Uses `tectonic` to run compilation.

## Installation
- Install tectonic, as per instructions here:
   https://tectonic-typesetting.github.io/en-US/install.html

- Build and run the server
    > npm install
    > npm run build
    > node dist/main.js run-server


## Usage
The server listens on localhost:9100 for POSTs to REST endpoint /latex/fragment
The expected format of the POST body is: {latex: 'some latex fragment'}

Some example curl commands:

> curl -d 'latex=Understanding $\boldsymbol{\delta}$-Function' http://localhost:9100/latex/fragment
> {"status": "ok"}

Fail if \boldsymbol is misspelled:
> curl -d 'latex=Understanding $\bldsym{\delta}$-Function' http://localhost:9100/latex/fragment
> {"status":"error","message":"Undefined control sequence"}


## Issues

### Including all needed packages
To get tectonic to compile a fragment, it is wrapped in a document that includes
all  of  necessary setup.  Part  of  that setup  is  a  list of  `\usepackage{}`
directives,  which make  various functions  available. For  example, to  use the
macro `\boldsymbol{..}`, the command `\usepackage{amsmath}` must be present. The
challenge  is knowing  ahead  of time  what  packages will  be  required for  an
arbitrary latex fragment.


### Incomprehensible error messages
The output of Tex's compiler can make  it difficult to understand the root cause
of an issue. Some work might be needed to make the reported errors clearer.


## Next Steps
- [ ] cleanup output artifacts from tectonic (pdf file is generated)
- [ ] document installation
- [ ] improve error messages, esp for longer fragments
    - [ ] split fragments into smallest chunks, one per line, to improve line error reporting
- [ ] compile a better list of positive and negative examples of markup
- [ ] check for zombie processes on error
- [ ] store error-contained submitted examples locally, for evaluation and improving system accuracy
- [ ] write installer/run script in ./bin/run
- [ ] figure out how to dynamically alter the tex wrapper  document with required \usepackage directives
