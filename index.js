const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ho0d8c2.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        const usersCollection = client.db('socialNetwork').collection('users');
        const postCollection = client.db('socialNetwork').collection('posts');
        const commentCollection = client.db('socialNetwork').collection('comments');
        
        app.get('/users', async(req, res)=>{
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })


        app.get('/users/queryEmail', async (req, res) => {

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = usersCollection.find(query);
            const user = await cursor.toArray();
            res.send(user);
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = {
                email: user.email,
                value: user.value    
            }
            const alreadySignup = await usersCollection.find(query).toArray();
            if (alreadySignup.length) {
                return res.send({ acknowledged: false });
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.patch('/users/:email', async (req, res) => {
            const email = req.params.email;
            const text = req.body;
            const query = { email};
            const option = {upsert : true};
            const updateDoc = {
                $set: {
                    bio: text.bio,
                    address: text.address,
                    email: text.email,
                    interests: text.interests,
                    languages: text.languages,
                    name: text.name,
                    university: text.university,
                    workExp: text.workExp
                }
            }
            const result = await usersCollection.updateOne(query, updateDoc, option);
            res.send(result);

        })

        app.get('/posts', async(req, res)=>{
            const query = {};
            const posts = await postCollection.find(query).sort({reactCount: -1}).toArray();
            res.send(posts);
        })


        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const post = await postCollection.findOne(query);
            res.send(post);
        })

         app.post('/posts', async (req, res) => {
            const post = req.body;
            const result = await postCollection.insertOne(post);
            res.send(result);
        });

        app.get('/comments/queryPost', async (req, res) => {

            let query = {};
            if (req.query.postId) {
                query = {
                    postId: req.query.postId
                }
            }
            const cursor = commentCollection.find(query);
            const comments = await cursor.toArray();
            res.send(comments);
        });

        app.post('/comment', async (req, res) => {
            const comment = req.body;
            const result = await commentCollection.insertOne(comment);
            res.send(result);
        });

        app.post('/react', async (req, res) => {
            // const {pId, count} = req.body;
            const postId = req.body.pId;
            const count = req.body.count;
            const updateDoc = {
                $set: {
                    reactCount : count + 1
                }
            }
            const postUpdate = await postCollection.updateOne({_id : ObjectId(postId)}, updateDoc);
            res.send(postUpdate);
        });

    }
    finally {

    }
}
run().catch(error => console.error(error));

app.get('/', (req, res) => {
    res.send('SocialNetworks server is running')
})

app.listen(port, () => {
    console.log(`SocialNetworks listening on port ${port}`)
});