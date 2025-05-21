export default async (req, res) => {
  const icalUrl = "https://de.airbnb.com/calendar/ical/21743442.ics?s=6d92bff07fa069c7c0edcd887050d531";

  try {
    const response = await fetch(icalUrl);
    const icalData = await response.text();
    const lines = icalData.split('\\n');
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

    const deduped = [...new Set(unavailable)].sort();
    res.status(200).json({ unavailable: deduped });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch or parse Airbnb calendar." });
  }
};
