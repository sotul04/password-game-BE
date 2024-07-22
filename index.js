require('dotenv').config();

const defaultSchema = {
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    image: {
        data: Buffer,
        contentType: String
    }
}
//port used
const port = 8080;

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // allow all domains
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    tlsInsecure: true
})
    .then(() => console.log('Database connected!'))
    .catch(err => console.error('Database connection error:', err));

const flagsSchema = new mongoose.Schema(defaultSchema);
const captchasSchema = new mongoose.Schema(defaultSchema);

const Flags = mongoose.model('Flags', flagsSchema);
const Captchas = mongoose.model('Captchas', captchasSchema);

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", async (_, res) => {
    res.send("Welcome to password-game server.")
});

const routerFlags = express.Router();

routerFlags.get("/", async (_, res) => {
    console.log("GET: sending flags.");
    try {
        const images = await Flags.find({});
        return res.status(200).send(images);
    } catch (err) {
        console.error(err);
        return res.status(400).send('Error retrieving images.');
    }
});

routerFlags.post("/", upload.single('image'), async (req, res) => {
    const { title, description } = req.body;

    const newFlag = new Flags({
        title,
        description,
        image: {
            data: req.file.buffer,
            contentType: req.file.mimetype
        }
    });

    console.log("POST: uploading flag.");

    try {
        await newFlag.save();
        return res.status(200).send(newFlag);
    } catch (error) {
        console.log(error);
        return res.status(400).send("Failed to add flag.");
    }
});

app.use("/flags", routerFlags);

const routerCaptchas = express.Router();

routerCaptchas.get("/", async (_, res) => {
    console.log("GET: sending captchas.");
    try {
        const images = await Captchas.find({});
        return res.status(200).send(images);
    } catch (err) {
        console.error(err);
        return res.status(400).send('Error retrieving images.');
    }
})

routerCaptchas.post("/", upload.single('image'), async (req, res) => {
    const { title, description } = req.body;

    const newCaptcha = new Captchas({
        title,
        description,
        image: {
            data: req.file.buffer,
            contentType: req.file.mimetype
        }
    });

    console.log("POST: uploading captcha.");

    try {
        await newCaptcha.save();
        return res.status(200).send(newCaptcha);
    } catch (error) {
        console.log(error);
        return res.status(400).send("Failed to add captcha.");
    }
})

app.use("/captchas", routerCaptchas);

const routerPort = express.Router();

routerPort.get("/", async (_, res) => {
    return res.status(200).send("Used-env " + port);
});

app.use("/port", routerPort);

app.listen(port, () => console.log(`Server is running on port ${port}`));
