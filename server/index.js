const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const authRouter = require("./routes/auth.routes");
const artistRouter = require("./routes/artist.routes");
const songRouter = require("./routes/song.routes");
const albumRouter = require("./routes/album.routes");
const paymentRouter = require("./routes/payment.routes");
const premiumRouter = require("./routes/premium.routes");
const profileRouter = require("./routes/profile.routes");
const genreRouter = require("./routes/genre.routes");
const playlistRouter = require("./routes/playlist.routes");








const app = express();
const PORT = process.env.PORT || config.serverPort;
const corsMiddleware = require("./middleware/cors.middleware");

app.use('/public', express.static('public'));
app.use('/music', express.static('music'));
app.use(corsMiddleware);
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/artist', artistRouter);
app.use('/api/track', songRouter);
app.use('/api/album', albumRouter);
app.use('/api/pay', paymentRouter);
app.use('/api/premium', premiumRouter);
app.use('/api/profile', profileRouter);
app.use('/api/genre', genreRouter);
app.use('/api/playlist', playlistRouter);




 


const start = async () => {
    try {
        await mongoose.connect(config.dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => {
            console.log('Database sucessfully connected')
        },
            error => {
                console.log('Database could not be connected: ' + error)
            }
        );
        app.listen(PORT, () => {
            console.log('Server started on port', PORT);
        })
    } catch (e) {

    }
}

start();