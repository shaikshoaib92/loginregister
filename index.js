const mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost:27017/user_management",{
//     useNewUrlParser: true, 
//     useUnifiedTopology: true
// });
const uri = 'mongodb://localhost:27017/user_management';

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    autoIndex: false, // Don't build indexes
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4 // Use IPv4, skip trying IPv6
}


mongoose.connect(uri,options);
const express = require("express");
const app = express();


//for user routes
const userRoute = require('./routes/userRoutes');
app.use('/',userRoute);

app.listen(3000,function(){
    console.log("Server is running...");
})