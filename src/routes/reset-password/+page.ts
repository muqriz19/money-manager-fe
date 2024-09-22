export const load = ({ url }) => {
	const email = url.searchParams.get('email');
	const resetPasswordTemp = url.searchParams.get('resetPasswordTemp');

	return {
		email,
		resetPasswordTemp
	};
};
