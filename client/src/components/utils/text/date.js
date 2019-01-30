/**
 * Format UTC milliseconds date to numeric string (ex: `2018-08-28T16:09:15.658Z`)
 *
 * @param {String} utcDate It's the UTC number, but as a string.
 */
export const numericUTCDate = utcDate => {
    var date = new Date(Number(utcDate));
    return date.toISOString();
};
