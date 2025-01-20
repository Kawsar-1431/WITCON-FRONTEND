// Updated flight mock data with varied routes, airlines, and times
const mockFlights = [
  {
    origin: 'New York',
    destination: 'London',
    date: '2024-01-15',
    price: 500,
    airline: 'Delta',
    stops: 0, // Direct flight
    duration: 7, // Flight duration in hours
    departureTime: '2024-01-15T09:00:00',
  },
  {
    origin: 'New York',
    destination: 'London',
    date: '2024-01-16',
    price: 450,
    airline: 'British Airways',
    stops: 1, // One stop
    duration: 8,
    departureTime: '2024-01-16T11:00:00',
  },
  {
    origin: 'Los Angeles',
    destination: 'Tokyo',
    date: '2024-01-20',
    price: 700,
    airline: 'ANA',
    stops: 1, // One stop
    duration: 10,
    departureTime: '2024-01-20T16:30:00',
  },
  {
    origin: 'Los Angeles',
    destination: 'Tokyo',
    date: '2024-01-21',
    price: 720,
    airline: 'Japan Airlines',
    stops: 0, // Direct flight
    duration: 11,
    departureTime: '2024-01-21T18:00:00',
  },
  {
    origin: 'Mumbai',
    destination: 'Dubai',
    date: '2024-02-10',
    price: 300,
    airline: 'Emirates',
    stops: 0,
    duration: 3,
    departureTime: '2024-02-10T06:00:00',
  },
  {
    origin: 'Dubai',
    destination: 'New York',
    date: '2024-04-10',
    price: 550,
    airline: 'Emirates',
    stops: 0,
    duration: 8,
    departureTime: '2024-04-10T08:00:00',
  },
  {
    origin: 'Mumbai',
    destination: 'London',
    date: '2024-03-25',
    price: 650,
    airline: 'Air India',
    stops: 1,
    duration: 11,
    departureTime: '2024-03-25T13:30:00',
  },
  {
    origin: 'Tokyo',
    destination: 'Los Angeles',
    date: '2024-05-25',
    price: 650,
    airline: 'Japan Airlines',
    stops: 0,
    duration: 11,
    departureTime: '2024-05-25T07:30:00',
  },
  {
    origin: 'Los Angeles',
    destination: 'London',
    date: '2024-06-01',
    price: 600,
    airline: 'British Airways',
    stops: 0,
    duration: 9,
    departureTime: '2024-06-01T14:30:00',
  },
  {
    origin: 'New York',
    destination: 'Dubai',
    date: '2024-07-12',
    price: 750,
    airline: 'Qatar Airways',
    stops: 1,
    duration: 12,
    departureTime: '2024-07-12T10:00:00',
  },
  {
    origin: 'London',
    destination: 'New York',
    date: '2024-08-05',
    price: 500,
    airline: 'American Airlines',
    stops: 0,
    duration: 8,
    departureTime: '2024-08-05T15:00:00',
  },
  {
    origin: 'Dubai',
    destination: 'Tokyo',
    date: '2024-09-12',
    price: 900,
    airline: 'Emirates',
    stops: 1,
    duration: 14,
    departureTime: '2024-09-12T07:00:00',
  },
  {
    origin: 'Los Angeles',
    destination: 'New York',
    date: '2024-10-10',
    price: 400,
    airline: 'JetBlue',
    stops: 0,
    duration: 5,
    departureTime: '2024-10-10T12:00:00',
  },
];

// Get price filter and value display elements
const priceFilter = document.getElementById('priceFilter');
const priceValue = document.getElementById('priceValue');

// Event listener for the price filter to update the price value display
priceFilter.addEventListener('input', function () {
  priceValue.textContent = priceFilter.value; // Update the displayed max price value
  filterFlights(); // Re-filter flights based on the selected max price
});

// Event listener for the search form submission
document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Get user input values
  const origin = document.getElementById('origin').value.toLowerCase();
  const destination = document.getElementById('destination').value.toLowerCase();
  const selectedDate = document.getElementById('date').value;

  // Filter flights by exact match (origin, destination, and date)
  const exactMatches = mockFlights.filter(flight =>
    flight.origin.toLowerCase().includes(origin) &&
    flight.destination.toLowerCase().includes(destination) &&
    flight.date === selectedDate &&
    flight.price <= priceFilter.value // Filter by price
  );

  // Filter flights by origin and destination only (suggest alternatives)
  const alternativeMatches = mockFlights.filter(flight =>
    flight.origin.toLowerCase().includes(origin) &&
    flight.destination.toLowerCase().includes(destination) &&
    flight.date !== selectedDate &&
    flight.price <= priceFilter.value // Filter by price
  );

  // Display results
  displayFlights(exactMatches, alternativeMatches, origin, destination, selectedDate);
});

// Function to display flights
function displayFlights(exactMatches, alternativeMatches, origin, destination, selectedDate) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Clear previous results

  // If no exact matches and no alternative matches, show a message about wrong route
  if (exactMatches.length === 0 && alternativeMatches.length === 0) {
    resultsDiv.innerHTML = `<p>No flights found for this route under $${priceFilter.value}.</p>`;
    return; // Stop here if no flights are found for the route
  }

  // Check if any exact matches are found
  if (exactMatches.length > 0) {
    resultsDiv.innerHTML += `<h3>Flights for ${new Date(selectedDate).toLocaleDateString()}:</h3>`;
    exactMatches.forEach(flight => {
      const flightCard = document.createElement('div');
      flightCard.className = 'flight-card';
      flightCard.innerHTML = `
        <p><strong>Airline:</strong> ${flight.airline}</p>
        <p><strong>Origin:</strong> ${flight.origin}</p>
        <p><strong>Destination:</strong> ${flight.destination}</p>
        <p><strong>Date:</strong> ${new Date(flight.date).toLocaleDateString()}</p>
        <p><strong>Departure Time:</strong> ${new Date(flight.departureTime).toLocaleString()}</p>
        <p><strong>Duration:</strong> ${flight.duration} hours</p>
        <p><strong>Stops:</strong> ${flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}</p>
        <p><strong>Price:</strong> $${flight.price}</p>
      `;
      resultsDiv.appendChild(flightCard);
    });
  }

  // If alternative matches are found, suggest other dates or routes
  if (alternativeMatches.length > 0) {
    resultsDiv.innerHTML += `<h3>But we have flights for other dates:</h3>`;
    alternativeMatches.forEach(flight => {
      const flightCard = document.createElement('div');
      flightCard.className = 'flight-card';
      flightCard.innerHTML = `
        <p><strong>Airline:</strong> ${flight.airline}</p>
        <p><strong>Origin:</strong> ${flight.origin}</p>
        <p><strong>Destination:</strong> ${flight.destination}</p>
        <p><strong>Date:</strong> ${new Date(flight.date).toLocaleDateString()}</p>
        <p><strong>Departure Time:</strong> ${new Date(flight.departureTime).toLocaleString()}</p>
        <p><strong>Duration:</strong> ${flight.duration} hours</p>
        <p><strong>Stops:</strong> ${flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}</p>
        <p><strong>Price:</strong> $${flight.price}</p>
      `;
      resultsDiv.appendChild(flightCard);
    });
  }
}
