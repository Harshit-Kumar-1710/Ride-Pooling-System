const { awardCredits, getBalance, getHistory } = require('../services/creditService');

const getMyBalance = async (req, res) => {
  try {
    const balance = await getBalance(req.user.id);
    res.status(200).json({ balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyHistory = async (req, res) => {
  try {
    const history = await getHistory(req.user.id);
    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyBalance, getMyHistory };