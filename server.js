var port = process.env.PORT || 5000;

//server.js
const { app } = require("./app");

app.listen(port, () => {
    console.log(`Escuchando en puerto... ${port}`);
});