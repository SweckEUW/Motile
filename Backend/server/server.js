import express from "express"
import cors from "cors"
import mongodb from "mongodb"
import MotileParts from "./motilePartsCollection.js"
import Users from "./usersCollection.js"

const app = express();

app.use(cors());
app.use(express.json());

// Connect to Database
const MongoClient = mongodb.MongoClient
MongoClient.connect(
    'mongodb://localhost:27017/Motile', 
    {useNewUrlParser: true},
)
.catch(error => { 
    console.error(error);
    process.exit(1);
}).then(async client =>{
    console.log("Connected to Database")
    await MotileParts.retrieveMotilePartsCollection(client);
    await Users.retrieveUsersCollection(client);
    app.listen(5000,() =>{
        console.log('Server started')
    });
})

app.get('/MotileParts', MotileParts.getMotileParts);
app.get('/Users', Users.getUser);

app.post('/Users', (req, res)=> {
   Users.addUser(req.body);
});

export default app