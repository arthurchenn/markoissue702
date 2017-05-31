Prerequisite:
  download source code of markoissue702
  cd markoissue702
  npm install


How to reproduce the error:

  1) npm install --save marko@4.4.6(or any other version higher than 4.3.1)
  2) webpack
  3) cd target/markoissue702
  4) node ./server.js

  you should see the error.


How to fix the error:
  1) npm install --save marko@4.3.1
  2) webpack
  3) cd target/markoissue702
  4) node ./server.js

  you can browse to http://localhost:3000, see the hello world page.
