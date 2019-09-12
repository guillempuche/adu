const faker = require('faker');
const cuid = require('cuid');

module.exports = function makeFakeUser(overrides) {
    const displayName = faker.name.firstName();
    const fullName = displayName + ' ' + faker.name.lastName();

    const user = {
        _id: cuid(),
        name: {
            displayName,
            fullName
        },
        emails: {
            auth: fullName.toLowerCase().replace(/ /g, '') + '@email.com',
            account: displayName.toLowerCase() + '@email.com'
        },
        profilePicture: faker.internet.avatar(),
        roles: ['admin'],
        _faculties: [cuid()]
    };

    return { ...user, ...overrides };
};
