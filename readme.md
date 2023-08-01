## LaTex Validation
Utilities to validate the syntax of Latex fragments.

Uses `tectonic` to run compilation.

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
