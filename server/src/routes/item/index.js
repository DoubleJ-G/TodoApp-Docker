const express = require('express');
const router = express.Router();

const db = require('../../database')
const uuid = require('uuid');

// GET without a specific ID returns all items

router.get('/', (req, res) => { 
    // Run Select Query to find all TodoItems
    db.any({
        text: 'SELECT * FROM TodoItems;'
    })
        // Query ran successfully
        .then( data => { 
            res.status(200).send(data);
        })
        // Error with Query
        .catch( error => { 
            console.log('Error from GET /v1/items/: ', error)
            res.sendStatus(500);
        })
})

// GET with a specific ID returns that ID ( if any match )

router.get('/:id', (req, res) => { 

    if ( !uuid.validate(req.params.id) ) { 
        res.status(422).send("Expected id to be a UUIDv4 string");
        return;
    }

    // Run Select Query to find TodoItems that match req.params.id
    db.any({
        text: 'SELECT * FROM TodoItems WHERE id = $1;',
        values: [req.params.id]
    })
        // Query ran successfully
        .then( data => { 
            res.status(200).send(data);
        })
        // Error with Query
        .catch( error => { 
            console.log('Error from GET /v1/items/:id: ', error)
            res.sendStatus(500);
        })
})

/* POST /v1/items

    Expects JSON { 
        item_name: String, 
        completed: Boolean ( Optional )
    }

    Returns ID of created TodoItem

*/

router.post('/', (req, res) => { 

    // Content-Type validation
    var contentType = req.headers['content-type'];
    if ( !contentType || contentType.indexOf('application/json') !== 0) { 
        res.status(415).send("Expected content-type application/json got " + contentType);
        return;
    }

    
    // Data validation
    let { item_name, completed } = req.body; 
    completed = completed || false;

    if ( typeof(item_name) !== "string") { 
        res.status(422).send("Expected body.item_name to be string got " + typeof(item_name));
        return;
    } 

    if ( typeof(completed) !== "boolean" || typeof(completed) == "undefined") { 
        res.status(422).send("Expected body.completed to be boolean got " + typeof(item_name));
        return;
    } 

    db.one({ 
        text: 'INSERT INTO TodoItems (id, item_name, completed) VALUES ($1, $2, $3) RETURNING id',
        values: [uuid.v4(), item_name, completed]
    })
        // Query Success. Return ID to client
        .then( data => { 
            res.status(201).send(data.id)
        })
        .catch( error => { 
            res.sendStatus(500);
            console.log("Error from POST /v1/items/", error)
        })

})
// DELETE

router.delete('/:id', (req, res) => { 

    // Data validation
    
    if ( !uuid.validate(req.params.id) ) { 
        res.status(422).send("Expected id to be a UUIDv4 string");
        return;
    }

    db.any({
        text: 'DELETE FROM TodoItems WHERE id = $1 RETURNING id;',
        values: [req.params.id]
    })
    .then( data => { 
        // QUERY returns ID's of those deleted, if no ID's are returned no ID matched request so 404 NOT FOUND
        if (data.length===0) { 
            res.sendStatus(404)
        } else { 
        // QUERY returns ID's of those deleted, if above zero then success. Return 204 SUCCESS NO CONTENT
            res.sendStatus(204)
        }
    })
    .catch( error => { 
        console.log("Error from DELETE /v1/items/:id", error)
        res.sendStatus(500);
    })
    
})

router.put('/:id', (req, res) => { 

    // Try to find a current resource from :id
    db.oneOrNone({
        name: 'select-item',
        text: 'SELECT * FROM TodoItems WHERE id = $1;',
        values: [req.params.id]
    })
        .then( data => { 
            // QUERY returning 0 means resource doesn't exist, lets create it
            if (data.length===0) { 
                db.one({
                    name: 'insert-item',
                    text: 'INSERT INTO TodoItems VALUES ($1, $2, $3) RETURNING id;',
                    values: [req.params.id, req.body.item_name, req.body.completed || 'FALSE']
                })
                .then( data => { 
                    res.status(201).send(data);
                })
                .catch( error => {  
                    console.log("Error with INSERT from PUT /v1/items/", error)
                    res.sendStatus(500);
                })
            } else { 
            // QUERY returning 1 means resource already exists, update it 
                db.one({
                    name: 'update-item',
                    text: 'UPDATE TodoItems SET id = $1, item_name = $2, completed = $3 WHERE id =$1 RETURNING *',
                    values: [req.params.id, req.body.item_name || data.item_name, req.body.completed || data.completed]
                })
                .then( data => { 
                    res.sendStatus(204);
                })
                .catch( error => { 
                    console.log("Error with UPDATE from PUT /v1/items/", error)
                    res.sendStatus(500);
                })
            }
        })
        .catch( error => { 
            console.log("Error with SELECT from PUT /v1/items/", error)
            res.sendStatus(500);
        })
        

})
module.exports = router
