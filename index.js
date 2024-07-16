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
const port = process.env.PORT || 3000;

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // allow all domains
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    next();
});

mongoose.connect(
    process.env.MONGODB_URL,
    {}
);

const flagsSchema = new mongoose.Schema(defaultSchema);
const captchasSchema = new mongoose.Schema(defaultSchema);

const Flags = mongoose.model('Flags', flagsSchema);
const Captchas = mongoose.model('Captchas', captchasSchema);

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", async (_, res) => {
    res.send("Welcome to password-game server.")
});

const routerFlags = express.Router();

routerFlags.get("/" , async (_, res) => {
    console.log("GET: sending flags.");
    try {
        const images = await Flags.find({});
        return res.status(200).json(images);
    } catch (err) {
        console.error(err);
        return res.status(400).send('Error retrieving images.');
    }
});

app.use("/flags", routerFlags);

const routerCaptchas = express.Router();

routerCaptchas.get("/", async (_, res) => {
    console.log("GET: sending captchas.");
    try {
        const images = await Captchas.find({});
        res.status(200).json(images);
    } catch (err) {
        console.error(err);
        res.status(400).send('Error retrieving images.');
    }
})

app.use("/captchas", routerCaptchas);

const routerPort = express.Router();

routerPort.get("/", (_, res) => {
    return res.status(200).send("Used-port "+port);
})

app.post("/flags", upload.single('image'), async (req, res) => {
    const {title, description} = req.body;

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
        res.status(200).send(newFlag);
    } catch (error) {
        console.log(error);
        res.status(400).send("Failed to add flag.");
    }
});

app.post("/captchas", upload.single('image'), async (req, res) => {
    const {title, description} = req.body;

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
        res.status(200).send(newCaptcha);
    } catch (error) {
        console.log(error);
        res.status(400).send("Failed to add captcha.");
    }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
