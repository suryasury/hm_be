exports.determineTimePeriod = (startTime) => {
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
};

exports.convertToDateTime = (timeString) => {
  const [time, period] = timeString.split(" ");
  const [hours, minutes] = time.split(":");

  let hoursNum = parseInt(hours, 10);
  if (period === "PM") {
    hoursNum += 12;
    if (hoursNum === 24) hoursNum = 12;
  } else if (hoursNum === 12) {
    hoursNum = 0;
  }

  const date = new Date();
  date.setHours(hoursNum, parseInt(minutes, 10), 0, 0);

  return date.toISOString();
};

exports.getStartAndEndOfDay = (date) => {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  return { startDate, endDate };
};
