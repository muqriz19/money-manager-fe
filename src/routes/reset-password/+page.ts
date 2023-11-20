export const load = ({ fetch, params, url }) => {
    let email = url.searchParams.get('email');

    return {
        email
    };
}