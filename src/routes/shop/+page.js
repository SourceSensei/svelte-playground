export const load = async ({ fetch }) => {
	const fetchProducts = async () => {
		const productRes = await fetch('https://dummyjson.com/products?limit=10');
		const productData = await productRes.json();
		return productData.products;
	};

	// const fetchUsers = async () => {
	// 	const userRes = await fetch('https://dummyjson.com/users?limit=10');
	// 	const usersData = await userRes.json();
	// 	return usersData.users;
	// };

	return {
		products: fetchProducts()
		// users: fetchUsers()
	};
};
