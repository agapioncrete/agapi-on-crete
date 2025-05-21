const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const icalUrl = "https://de.airbnb.com/calendar/ical/21743442.ics?s=6d92bff07fa069c7c0edcd887050d531";

  try {
    const response = await fetch(icalUrl);
    const icalData = await response.text();
    const lines = icalData.split('\n');
    const unavailable = [];
    let start = null;

    for (const line of lines) {
      if (line.startsWith('DTSTART')) {
        start = line.split(':')[1].trim();
      } else if (line.startsWith('DTEND') && start) {
        const end = line.split(':')[1].trim();
        const startDate = new Date(start);
        const endDate = new Date(end);

        while (startDate < endDate) {
          unavailable.push(startDate.toISOString().split('T')[0]);
          startDate.setDate(startDate.getDate() + 1);
        }
        start = null;
      }
    }

    // 🛠 Add your manual blockout dates here
    const manuallyBlocked = [
      "2025-06-01",
      "2025-06-15",
      "2025-07-01"
    ];

    const deduped = [...new Set([...unavailable, ...manuallyBlocked])].sort();

    return {
      statusCode: 200,
      body: JSON.stringify({ unavailable: deduped })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch or parse Airbnb calendar." })
    };
  }
};
