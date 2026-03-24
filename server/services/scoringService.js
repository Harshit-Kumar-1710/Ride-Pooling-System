const MAX_DISTANCE_KM = 20;
const MAX_TIME_DIFF_MINUTES = 60;

const W_DISTANCE = 0.5;
const W_TIME = 0.3;
const W_RATING = 0.2;

const scoreRide = (ride, passengerQuery) => {
  const normDistance = Math.min(ride.detourDistance / MAX_DISTANCE_KM, 1);

  const rideTime = new Date(ride.departureTime).getTime();
  const preferredTime = new Date(passengerQuery.preferredTime).getTime();
  const diffMinutes = Math.abs(rideTime - preferredTime) / (1000 * 60);
  const normTime = Math.min(diffMinutes / MAX_TIME_DIFF_MINUTES, 1);

  const rating = ride.driverRating || 3.0;
  const normRating = rating / 5.0;

  const score = (W_DISTANCE * normDistance) + (W_TIME * normTime) - (W_RATING * normRating);

  return parseFloat(score.toFixed(4));
};

module.exports = { scoreRide };