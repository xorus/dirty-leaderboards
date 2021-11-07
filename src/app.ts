import express from 'express';
import {Low, JSONFile} from 'lowdb';
import bodyParser from "body-parser";

export interface Settings {
    // secret: string,
    // appHost: string,
    dbFile: string
}

interface Score {
    name: string,
    score: number
}

interface DbContents {
    leaderboard: Score[]
}

const DEFAULT_LIMIT = 25;

export function get(settings: Settings) {
    const app = express();
    const router = express.Router();
    const adapter = new JSONFile<DbContents>(settings.dbFile)
    const db = new Low<DbContents>(adapter)
    db.read().then(async () => {
        if (db.data === null) {
            db.data ||= {leaderboard: []}
            await db.write()
        }
    })

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
    app.use(bodyParser.raw());

    router.get('/leaderboard', async (req, res) => {
        await db.read();

        if (!db.data) {
            throw new Error('error while loading data');
        }

        const count = parseInt((req.query.count ?? DEFAULT_LIMIT) as string);
        const scores = db.data.leaderboard.sort((a, b) => {
            return b.score > a.score ? 1 : -1;
        }).slice(0, count);

        res.set('Cache-Control', 'private, max-age=5')
        res.send(scores);
    });

    router.post('/leaderboard', async (req, res) => {
        await db.read();
        if (!db.data) {
            throw new Error('error while loading data');
        }

        const count = parseInt((req.query.count ?? DEFAULT_LIMIT) as string);
        try {
            const name = req.body.name;
            if (typeof name !== "string" || name.trim().length === 0) {
                console.error("no name", req.body)

                res.sendStatus(400);
                return;
            }
            const score = req.body.score;
            if (typeof score !== "string" || score.trim().length === 0) {
                console.error("no score", req.body)
                res.sendStatus(400);
                return;
            }

            db.data.leaderboard.push({
                name: name.substr(0, 3),
                score: parseInt(score)
            })
            const scores = db.data.leaderboard.sort((a, b) => {
                return b.score > a.score ? 1 : -1;
            }).slice(0, count);
            db.data.leaderboard = scores;
            await db.write();
            res.send(scores);
        } catch (e) {
            console.error("something errored", e);
            res.sendStatus(400);
        }
    });

    app.use(router);
    return app;
}
