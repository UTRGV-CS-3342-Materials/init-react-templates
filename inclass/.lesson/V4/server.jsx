import express from 'express';
import { renderToString } from 'react-dom/server';
import Database from 'better-sqlite3';

/*-------------------------------------------------------
- Exercise
- update POST handler for adding reviews
- show optional errors (list), default values (author, content) in ItemView
-------------------------------------------------------*/

/*-------------------------------------------------------
- Exercise
- check for errors (blank author, content) in POST and reject review
- show errors to user and keep values they typed in (can't just redirect!)
-------------------------------------------------------*/

import { Items } from './app/Items.jsx';
import { ItemView } from './app/ItemView.jsx';

const PORT = 8080;

// paths are relative to the project root, because that is where `npm start` runs.
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
	send(res, <ItemView item={item} reviews={reviews} />);
});

app.post('/item_view/:item_id', (req, res) => {
	const itemId = parseInt(req.params.item_id);

	

	// send the browswer back to the view route
	res.redirect(`/item_view/${itemId}`);
});

app.listen(PORT, () => console.log(`http://localhost:${PORT}/items`));
