module.exports = (req, res, next) => {
    if (!req.user) {
        // Show an error message
        return res.status(401).send({ error: "You must log in!" });
    }

    next();
};
