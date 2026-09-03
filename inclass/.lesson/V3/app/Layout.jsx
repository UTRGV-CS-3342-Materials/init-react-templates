// The entire document is a component
// `children` is a specially named prop that maps to the tag body (rather than the tag attributes)
export function Layout({ title, children }) {
	return (
		<html>
			<head>
				<title>{title}</title>
				<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" />
				<link rel="stylesheet" href="/main.css" />
			</head>
			<body>
				<div className="container">{children}</div>
			</body>
		</html>
	);
}
