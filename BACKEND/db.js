const mongoose = require('mongoose');
// 127.0.0.1
const mongoURI = "mongodb://127.0.0.1:27017/inotebook"
mongoose.set('strictQuery', false);
mongoose.set('strictQuery', true);

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=>{
        console.log("Connect to mongo Sucessfully");
    })
}

module.exports = connectToMongo;