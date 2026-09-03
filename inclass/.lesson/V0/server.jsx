import express from 'express';
import Database from 'better-sqlite3';

/*-------------------------------------------------------
- Example
- import react rendering system
- create Hello component (jsx)
- render Hello component in items route
-------------------------------------------------------*/

/*-------------------------------------------------------
- Example
- create Item component
- pass in items data (props)
- display the first item in the data (using html from mockup)
- loop over data in JSX (map)
-------------------------------------------------------*/

const PORT = 8080;

const db = new Database('shopping.sqlite');

const app = express();
app.use(express.static('static'));
app.use(express.urlencoded({ extended: false }));

app.get('/items', (req, res) => {
	const items = db.prepare('SELECT * FROM item').all();

	res.send("Display all items here.");
});

app.get('/item_view/:item_id', (req, res) => {
	const itemId = parseInt(req.params.item_id);
	
	const item = db.prepare('SELECT * FROM item WHERE id = ?').get(itemId);
	if (!item) return res.status(404).send('No such item.');

	const reviews = db.prepare('SELECT * FROM review WHERE item_id = ?').all(itemId);

	res.send(`Display item ${itemId} and its reviews here.`);
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}/items`));
