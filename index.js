const express = require("express");

require("dotenv").config();

const { connection } = require("./config/db");

const { userRoute } = require("./routes/user.route");

const {postRoute}=require("./routes/post.route")

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to Social Media App")
});

app.use("/user", userRoute);
app.use("/post", postRoute);

app.listen(process.env.port, async () => {
    try {
        await connection;
        console.log('Connected to server');
    } catch (error) {
        console.log({"Message":error.message});
    }
    console.log(`Server is running on port ${8000}`);
})