import {get as getApp} from './app.js';

const PORT: number = Number(process.env.PORT || 3010);

const app = getApp({
    // secret: String(process.env.SECRET || "ThisIsNotSoSecretChangeIt2"),
    // appHost: String(process.env.APP_HOST || "app")
    dbFile: String(process.env.DB_FILE || "db.json")
});
const server = app.listen(PORT, () => {
    console.info(`Listening port on ${PORT}.`);
});

// Terminate process
process.on('SIGINT', async () => {
    try {
        console.log("Received SIGINT")
        server.close((err: any) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            console.info('Bye.');
            process.exit(0);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});
