export function Items({ items }) {

	// for loop example
	const list = ['a','b','c','d','e'];

	return (


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
								<tr>
									<td rowSpan={2}>
										<img className="thumb" src={items[0].image_url} />
									</td>
									<td>
										<span className="name">
											<a href={`/item_view/${items[0].id}`}>{items[0].name}</a>
										</span>
									</td>
									<td className="price">${items[0].cost}</td>
								</tr>
								<tr>
									<td colSpan={2}>{items[0].description}</td>
								</tr>
							</tbody>
						</table>

						<h3>Loop Example</h3>
						<ul>
							{/* map over data to generate a subtree for each
								must provide a unique key attribute for any repeated elements */}
							{list.map((letter,i) => 
								<li key={i}>{letter}</li>
							))}
						</ul>
					</div>
				</div>
			</body>
		</html>
	);
}
