const Server = require('../rest/Server');

class App {
     initServer(port) {
        const server = new Server(port);
        server.start().then((res) => {
            console.log("server started successfully from app");
        }).catch((err) => {
            console.log("Error occurred: " + err);
        });
    }
}


const app = new App();

app.initServer(3300);