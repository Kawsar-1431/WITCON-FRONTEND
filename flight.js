// Get price filter and value display elements
const priceFilter = document.getElementById('priceFilter');
const priceValue = document.getElementById('priceValue');

// Event listener for the price filter to update the price value display
priceFilter.addEventListener('input', function () {
  priceValue.textContent = priceFilter.value; // Update the displayed max price value
});

// Event listener for the search form submission
document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();

  // Get user input values
  const origin = document.getElementById('origin').value;
  const destination = document.getElementById('destination').value;
  const selectedDate = document.getElementById('date').value;
  const maxPrice = priceFilter.value;

  // Send API request to the backend
  axios.get('http://localhost:3000/flights', {
    params: {
      origin,
      destination,
      date: selectedDate,
      maxPrice
    }
  })
  .then(response => {
    displayFlights(response.data, origin, destination, selectedDate);
  })
  .catch(error => {
    console.error('Error fetching flights:', error);
  });
});

// Function to display flights
function displayFlights(flights, origin, destination, selectedDate) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Clear previous results

  if (flights.length === 0) {
    resultsDiv.innerHTML = `<p>No flights found for this route under $${priceFilter.value}.</p>`;
    return;
  }

  resultsDiv.innerHTML += `<h3>Available Flights:</h3>`;
  flights.forEach(flight => {
    const flightCard = document.createElement('div');
    flightCard.className = 'flight-card';
    flightCard.innerHTML = `
      <p><strong>Airline:</strong> ${flight.name}</p>
      <p><strong>Seats:</strong> ${flight.seats}</p>
      <p><strong>Price:</strong> $${flight.price}</p>
    `;
    resultsDiv.appendChild(flightCard);
  });
}
