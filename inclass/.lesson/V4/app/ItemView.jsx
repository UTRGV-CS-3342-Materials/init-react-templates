import { Layout } from './Layout.jsx';

function Review({ review }) {
	return (
		<div className="card w-100 mt-3">
			<div className="card-header">
				<em>{review.author}</em>
			</div>
			<div className="card-body">
				<p>{review.content}</p>
			</div>
		</div>
	);
}

export function ItemView({ item, reviews}) {
	return (
		<Layout title="Incredibly Simple Shopping">
			<div className="pb-2 mt-4 mb-2 border-bottom">
				<h1>{item.name}</h1>
				<p>
					(<a href="/items">back</a>)
				</p>
			</div>

			<div className="row">
				<div className="col-4">
					<img className="img-fluid" src={item.image_url} />
				</div>
				<div className="col-4">
					<div>{item.description}</div>
					<div>
						<em>${item.cost}</em>
					</div>
				</div>
			</div>

			<div className="row my-4">
				<div className="col-8">
					<h3>Reviews</h3>

					<div className="card w-100 mt-3">
						<div className="card-body">
							<form method="POST">
								<div className="form-group">
									<label>Add your review!</label>
									<input
										className="form-control mb-1"
										placeholder="Name"
										name="author"
									/>
								</div>
								<div className="form-group">
									{/* html uses <textarea></textarea>, react treats it like input */}
									<textarea
										className="form-control mb-1"
										placeholder="Review"
										name="content"
									/>
								</div>
								<div className="form-group">
									<button type="submit" className="btn btn-primary">
										Submit
									</button>
								</div>
							</form>
						</div>
					</div>

					{reviews.map((review) => (
						<Review key={review.id} review={review} />
					))}
				</div>
			</div>
		</Layout>
	);
}
