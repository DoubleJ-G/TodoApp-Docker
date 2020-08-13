const config = require('../config');

const pgConfig = { 
    host: config.pgHost,
    port: config.pgPort,
    database: config.pgDatabase,
    user: config.pgUser,
    password: config.pgPassword,
    max: 30,

    connect(client, dc, useCount) { 
        const cp = client.connectionParamters;
        console.log("Connected to database:", cp.database);
    }

}

const initOptions = { 

    connect(client, dc, useCount) {
        const cp = client.connectionParameters;
        console.log('Connected to database:', cp.database);
    },

    query(e) {
        let currentTime = new Date().toLocaleTimeString();
        console.log("*--------------------------*");
        console.log('| QUERY run at: ' + currentTime + ' |');
        console.log("*--------------------------*");
        console.log(e.query);
    }

}

const pgp = require('pg-promise')(initOptions);

var db = pgp(pgConfig);

/* Test DB Connection

db.connect() 
    .then( (obj) => { 
        console.log("DB Connection Successful");
        obj.done();
    })
    .catch( (err) => { 
        console.log("ERROR: ", error);
    })
*/

// Create TodoItem Table IF NOT EXISTS 

db.connect() 
    .then( (obj) => { 
        obj.query( 
            `CREATE TABLE IF NOT EXISTS TodoItems ( 
                id uuid, 
                item_name TEXT NOT NULL,
                completed BOOLEAN DEFAULT false,
                PRIMARY KEY (id)
            )`
        )
    })

module.exports = db;