const express = require("express");
const router = express.Router();

router.get("/", async (_, res) => {
    console.log("GET: sending flags.");
    try {
        const images = await Flags.find({});
        res.status(200).json(images);
    } catch (err) {
        console.error(err);
        res.status(400).send('Error retrieving images.');
    }
})