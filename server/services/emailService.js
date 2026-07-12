const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"RidePool GEU" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: wrapTemplate(html)
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const wrapTemplate = (content) => `
  <div style="font-family: 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 2rem; background: #12121c; color: #f0f0ff; border-radius: 16px; border: 1px solid #1e1e30;">
    <div style="text-align: center; margin-bottom: 1.5rem;">
      <span style="font-size: 1.4rem; font-weight: 900; color: #e63946; letter-spacing: -0.02em;">RidePool</span>
      <span style="font-size: 1.4rem; font-weight: 900; color: #f0f0ff; letter-spacing: -0.02em;"> GEU</span>
    </div>
    ${content}
    <hr style="border: none; border-top: 1px solid #1e1e30; margin: 1.5rem 0;" />
    <p style="color: #55556a; font-size: 0.78rem; text-align: center;">
      This is an automated email from RidePool GEU. Please do not reply.
    </p>
  </div>
`;

// ── Email Templates ──

const sendBookingConfirmation = async (passenger, ride, booking) => {
  await sendEmail(
    passenger.personalEmail,
    'RidePool GEU - Booking Confirmed! 🎉',
    `
      <h2 style="color: #22c55e; margin-bottom: 0.5rem;">✓ Booking Confirmed</h2>
      <p style="color: #9999bb;">Hi ${passenger.name},</p>
      <p style="color: #9999bb;">Your ride has been booked successfully!</p>
      <div style="background: #1a1a2e; border-radius: 12px; padding: 1rem; margin: 1rem 0;">
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Route:</strong> ${ride.origin?.label} → ${ride.destination?.label}</p>
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Pickup:</strong> ${booking.pickupPoint?.label}</p>
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Drop:</strong> ${booking.dropPoint?.label}</p>
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Departure:</strong> ${new Date(ride.departureTime).toLocaleString('en-IN')}</p>
      </div>
      <p style="color: #9999bb;">Have a safe ride! 🚗</p>
    `
  );
};

const sendNewBookingToDriver = async (driver, passenger, ride, booking) => {
  await sendEmail(
    driver.personalEmail,
    'RidePool GEU - New Booking on Your Ride! 🎫',
    `
      <h2 style="color: #e63946; margin-bottom: 0.5rem;">🎫 New Booking</h2>
      <p style="color: #9999bb;">Hi ${driver.name},</p>
      <p style="color: #9999bb;"><strong>${passenger.name}</strong> just booked a seat on your ride!</p>
      <div style="background: #1a1a2e; border-radius: 12px; padding: 1rem; margin: 1rem 0;">
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Route:</strong> ${ride.origin?.label} → ${ride.destination?.label}</p>
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Their pickup:</strong> ${booking.pickupPoint?.label}</p>
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Their drop:</strong> ${booking.dropPoint?.label}</p>
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Seats remaining:</strong> ${ride.seatsAvailable}</p>
      </div>
    `
  );
};

const sendBookingCancellation = async (user, ride, role) => {
  await sendEmail(
    user.personalEmail,
    'RidePool GEU - Booking Cancelled',
    `
      <h2 style="color: #ef4444; margin-bottom: 0.5rem;">✕ Booking Cancelled</h2>
      <p style="color: #9999bb;">Hi ${user.name},</p>
      <p style="color: #9999bb;">${role === 'passenger' ? 'Your booking has been cancelled.' : 'A passenger cancelled their booking on your ride.'}</p>
      <div style="background: #1a1a2e; border-radius: 12px; padding: 1rem; margin: 1rem 0;">
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Route:</strong> ${ride.origin?.label} → ${ride.destination?.label}</p>
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Departure:</strong> ${new Date(ride.departureTime).toLocaleString('en-IN')}</p>
      </div>
    `
  );
};

const sendRideCompleted = async (user, ride) => {
  await sendEmail(
    user.personalEmail,
    'RidePool GEU - Ride Completed! ⭐',
    `
      <h2 style="color: #22c55e; margin-bottom: 0.5rem;">✓ Ride Completed</h2>
      <p style="color: #9999bb;">Hi ${user.name},</p>
      <p style="color: #9999bb;">Your ride has been completed successfully!</p>
      <div style="background: #1a1a2e; border-radius: 12px; padding: 1rem; margin: 1rem 0;">
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Route:</strong> ${ride.origin?.label} → ${ride.destination?.label}</p>
      </div>
      <p style="color: #9999bb;">Don't forget to <strong style="color: #e63946;">rate your ride</strong>! ⭐</p>
    `
  );
};

const sendRideCancelledToPassengers = async (user, ride) => {
  await sendEmail(
    user.personalEmail,
    'RidePool GEU - Ride Cancelled',
    `
      <h2 style="color: #ef4444; margin-bottom: 0.5rem;">✕ Ride Cancelled</h2>
      <p style="color: #9999bb;">Hi ${user.name},</p>
      <p style="color: #9999bb;">Unfortunately, the driver cancelled the ride you were booked on.</p>
      <div style="background: #1a1a2e; border-radius: 12px; padding: 1rem; margin: 1rem 0;">
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Route:</strong> ${ride.origin?.label} → ${ride.destination?.label}</p>
        <p style="color: #f0f0ff; margin: 0.3rem 0;"><strong>Was scheduled:</strong> ${new Date(ride.departureTime).toLocaleString('en-IN')}</p>
      </div>
      <p style="color: #9999bb;">Please search for another ride.</p>
    `
  );
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendNewBookingToDriver,
  sendBookingCancellation,
  sendRideCompleted,
  sendRideCancelledToPassengers
};
