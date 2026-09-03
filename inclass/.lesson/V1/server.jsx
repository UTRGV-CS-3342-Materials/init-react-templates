import express from 'express';
import { renderToString } from 'react-dom/server';
import Database from 'better-sqlite3';

/*-------------------------------------------------------
- Exercise
- loop to display all items
- create and use ItemRow sub-component in Items.jsx (pass in item)
-------------------------------------------------------*/

import { Items } from './app/Items.jsx';

const PORT = 8080;

const db = new Database('shopping.sqlite');

const app = express();
app.use(express.static('static'));
app.use(express.urlencoded({ extended: false }));

function send(res, element) {
	res.send('<!DOCTYPE html>' + renderToString(element));
}

app.get('/items', (req, res) => {
	const items = db.prepare('SELECT * FROM item').all();
	send(res, <Items items={items} />);
});

app.get('/item_view/:item_id', (req, res) => {
	const itemId = parseInt(req.params.item_id);
	
	const item = db.prepare('SELECT * FROM item WHERE id = ?').get(itemId);
	if (!item) return res.status(404).send('No such item.');

	const reviews = db.prepare('SELECT * FROM review WHERE item_id = ?').all(itemId);

	res.send(`Display item ${itemId} and its reviews here.`);
});


app.listen(PORT, () => console.log(`http://localhost:${PORT}/items`));
