const get = (req, res) => {
  res.send('Check Out GET endpoint');
};

const post = (req, res) => {
  res.send('Check Out POST endpoint');
};

module.exports = {
  get,
  post,
};