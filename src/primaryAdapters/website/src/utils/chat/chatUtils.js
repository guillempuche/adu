export { createUUID };

/**
 *
 * Generate a Pubnub UUID or channel's name. 4 types:
 * - `client#<client's id>`
 * - `user#<user's id>`
 * - `room#<room's id>`
 * - `faculty#<faculty's id>`
 *
 * IMPORTANT: This name effects the working on Room & Message Routes APIs.
 * @param {string} key Can be: `client`, `users`, `rooms` or `faculty`.
 * @param {string} id Can be: client, user, room or faculty's id.
 * @return {string} UUID/Channel's name.
 */
function createUUID(key, id) {
    let type = '';

    if (key === 'client') type = 'client';
    else if (key === 'user') type = 'user';
    else if (key === 'room') type = 'room';
    else if (key === 'faculty') type = 'faculty';
    else throw Error(`We can't create a UUID of key=${key}.`);

    return type + '#' + id;
}
