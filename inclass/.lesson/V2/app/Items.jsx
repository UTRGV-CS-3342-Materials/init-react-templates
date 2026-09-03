// separate component for each item row
// things that are repeated are good candidates to be sub-components
function ItemRow({ item }) {
	return (
		<>
			<tr>
				<td rowSpan={2}>
					<img className="thumb" src={item.image_url} />
				</td>
				<td>
					<span className="name">
						<a href={`/item_view/${item.id}`}>{item.name}</a>
					</span>
				</td>
				<td className="price">${item.cost}</td>
			</tr>
			<tr>
				<td colSpan={2}>{item.description}</td>
			</tr>
		</>
	);
}

export function Items({ items }) {
	return (
		<html>
			<head>
				<title>Incredibly Simple Shopping</title>
				<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" />
				<link rel="stylesheet" href="/main.css" />
			</head>
			<body>
				<div className="container">
					<div className="pb-2 mt-4 mb-2">
						<h1>Buy More!</h1>
					</div>

					<div className="row col-8">
						<table className="table">
							<thead>
								<tr>
									<th></th>
									<th>Name</th>
									<th className="price">Price</th>
								</tr>
							</thead>
							<tbody>
								{/* map over items to generate a subtree for each
									must provide a unique key attribute for any repeated elements */}
								{items.map((item) => (
									<ItemRow key={item.id} item={item} />
								))}
							</tbody>
						</table>
					</div>
				</div>
			</body>
		</html>
	);
}
