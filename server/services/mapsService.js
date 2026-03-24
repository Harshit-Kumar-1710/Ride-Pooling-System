const haversine = require('haversine-distance');

const MAX_DETOUR_METERS = 1500;

const haversineMeters = (pointA, pointB) => {
  return haversine(
    { latitude: pointA.latitude, longitude: pointA.longitude },
    { latitude: pointB.latitude, longitude: pointB.longitude }
  );
};

const isPointNearSegment = (segStart, segEnd, point) => {
  const totalDist = haversineMeters(segStart, segEnd);
  const distViaPoint =
    haversineMeters(segStart, point) +
    haversineMeters(point, segEnd);
  return (distViaPoint - totalDist) <= MAX_DETOUR_METERS;
};

const isOnRoute = (origin, destination, pickupCoords, dropCoords) => {
  const pickupOnRoute = isPointNearSegment(origin, destination, pickupCoords);
  const dropOnRoute   = isPointNearSegment(origin, destination, dropCoords);
  return pickupOnRoute && dropOnRoute;
};

const getDetourDistance = (origin, destination, pickupCoords, dropCoords) => {
  const directDistance = haversineMeters(origin, destination);
  const withPassenger =
    haversineMeters(origin, pickupCoords) +
    haversineMeters(pickupCoords, dropCoords) +
    haversineMeters(dropCoords, destination);
  const detourMeters = withPassenger - directDistance;
  return parseFloat((Math.max(0, detourMeters) / 1000).toFixed(3));
};

module.exports = { isOnRoute, getDetourDistance };