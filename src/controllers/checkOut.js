const get = (req, res) => {
    console.log('CheckOut GET endpoint hit');
    res.send('CheckOut GET endpoint');
}

module.exports = {
    get
};