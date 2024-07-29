function determineTimePeriod(startTime) {
  const [time, period] = startTime.split(" ");
  const [hours, minutes] = time.split(":");
  let hour = parseInt(hours, 10);
  if (period === "PM" && hour !== 12) {
    hour += 12;
  }
  if (hour < 12) {
    return "morning";
  } else if (hour < 18) {
    return "afternoon";
  } else {
    return "evening";
  }
}

module.exports = determineTimePeriod;
