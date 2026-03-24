const User = require('../models/User');
const CreditLedger = require('../models/CreditLedger');

const BASE_CREDITS = 10;
const PER_PASSENGER_CREDITS = 5;

const awardCredits = async (driverId, passengerCount) => {
  const amount = BASE_CREDITS + (PER_PASSENGER_CREDITS * passengerCount);

  const user = await User.findById(driverId);
  if (!user) throw new Error('Driver not found');

  const newBalance = user.credits + amount;

  await User.findByIdAndUpdate(driverId, { credits: newBalance });

  await CreditLedger.create({
    userId: driverId,
    type: 'earn',
    amount,
    balanceAfter: newBalance,
    note: `Ride completed with ${passengerCount} passenger(s)`
  });

  return { awarded: amount, newBalance };
};

const getBalance = async (userId) => {
  const user = await User.findById(userId).select('credits');
  if (!user) throw new Error('User not found');
  return user.credits;
};

const getHistory = async (userId) => {
  return await CreditLedger.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);
};

module.exports = { awardCredits, getBalance, getHistory };