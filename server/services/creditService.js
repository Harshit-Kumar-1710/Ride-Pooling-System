const User = require('../models/User');
const CreditLedger = require('../models/CreditLedger');

const BASE_CREDITS = 10;
const PER_PASSENGER_CREDITS = 5;

const awardCredits = async (driverId, passengerCount) => {
  const count = Number.isFinite(passengerCount) ? passengerCount : 0;
  const amount = BASE_CREDITS + (PER_PASSENGER_CREDITS * count);

  const user = await User.findById(driverId);
  if (!user) throw new Error('Driver not found');

  const currentBalance = Number.isFinite(user.credits) ? user.credits : 0;
  const newBalance = currentBalance + amount;

  await User.findByIdAndUpdate(driverId, { credits: newBalance });

  await CreditLedger.create({
    userId: driverId,
    type: 'earn',
    amount,
    balanceAfter: newBalance,
    note: `Ride completed with ${count} passenger(s)`
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