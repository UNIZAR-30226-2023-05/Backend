var port = process.env.port || 3000;

var { app, server, io} = require("./app");

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//------------------OLD CODE------------------
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
