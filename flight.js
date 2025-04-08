const app = Vue.createApp({
  data() {
    return {
      // Tracks which section is currently being shown (e.g., login, search, etc.)
      currentSection: 'login',

      // User authentication inputs
      email: '',
      password: '',
      name: '',

      // Flight search filters
      searchParams: {
        origin: '',
        destination: '',
        date: '',
        maxPrice: 1000
      },
      sortBy: 'price',
      flights: [],
      showResults: false,
      noFlightsFound: false,
      isLoading: false,
      selectedFlight: null,

      // Hotel search filters
      hotelParams: {
        location: '',
        checkIn: '',
        checkOut: '',
        guests: 2,
        maxPrice: 500,
        stars: 0,
        amenities: []
      },
      hotels: [],
      showHotelResults: false,
      noHotelsFound: false,
      selectedHotel: null,

      // Passenger form visibility and data
      showPassengerForm: false,
      showHotelBookingForm: false,
      passenger: {
        firstName: '',
        lastName: '',
        passportNumber: '',
        email: '',
        seat: ''
      },
      hotelPassenger: {
        firstName: '',
        lastName: '',
        passportNumber: '',
        email: '',
        roomType: 'Standard'
      },

      // Example available seats for selection
      availableSeats: [
        { row: 1, seats: ["1A", "1B", "", "1C", "1D"] },
        { row: 2, seats: ["2A", "2B", "", "2C", "2D"] },
        { row: 3, seats: ["3A", "3B", "", "3C", "3D"] },
        { row: 4, seats: ["4A", "4B", "", "4C", "4D"] },
        { row: 5, seats: ["5A", "5B", "", "5C", "5D"] },
      ],

      // Hotel room types
      roomTypes: ['Standard', 'Deluxe', 'Suite', 'Executive'],

      // Persistent user data (from localStorage)
      users: JSON.parse(localStorage.getItem('users')) || [],
      currentUser: JSON.parse(localStorage.getItem('currentUser')) || null
    };
  },

  computed: {
    // Filter and sort flights based on price, duration, or airline
    filteredFlights() {
      let flights = this.flights.filter(flight => flight.price <= this.searchParams.maxPrice);

      if (this.sortBy === 'price') {
        flights.sort((a, b) => a.price - b.price);
      } else if (this.sortBy === 'duration') {
        flights.sort((a, b) => a.duration - b.duration);
      } else if (this.sortBy === 'airline') {
        flights.sort((a, b) => a.airline.localeCompare(b.airline));
      }

      return flights;
    },

    // Filters hotels based on price and star rating
    filteredHotels() {
      return this.hotels.filter(hotel => {
        const priceMatch = hotel.rate_per_night?.extracted_lowest <= this.hotelParams.maxPrice;
        const starsMatch = this.hotelParams.stars === 0 ||
          (hotel.extracted_hotel_class && hotel.extracted_hotel_class >= this.hotelParams.stars);

        return priceMatch && starsMatch;
      }).sort((a, b) => a.rate_per_night?.extracted_lowest - b.rate_per_night?.extracted_lowest);
    },

    // Extract a list of up to 20 unique amenities from available hotels
    availableAmenities() {
      const allAmenities = new Set();
      this.hotels.forEach(hotel => {
        if (hotel.amenities) {
          hotel.amenities.forEach(amenity => allAmenities.add(amenity));
        }
      });
      return Array.from(allAmenities).slice(0, 20);
    }
  },

  methods: {
    // Navigation handlers
    showLoginSection() {
      this.currentSection = 'login';
      this.clearData();
    },

    showSignupSection() {
      this.currentSection = 'signup';
      this.clearData();
    },

    showSearchSection() {
      if (!this.currentUser) {
        alert('Please login first');
        this.showLoginSection();
        return;
      }
      this.currentSection = 'search';
      this.showResults = false;
      this.showPassengerForm = false;
      this.showHotelBookingForm = false;
    },

    showHotelsSection() {
      if (!this.currentUser) {
        alert('Please login first');
        this.showLoginSection();
        return;
      }
      this.currentSection = 'hotels';
      this.showHotelResults = false;
      this.showPassengerForm = false;
      this.showHotelBookingForm = false;
    },

    showBookingsSection() {
      if (!this.currentUser) {
        alert('Please login first');
        this.showLoginSection();
        return;
      }

      try {
        // Updates current user data with latest from localStorage
        const updatedUsers = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUser = updatedUsers.find(u => u.id === this.currentUser.id);

        if (updatedUser) {
          if (!updatedUser.bookings) {
            updatedUser.bookings = [];
          }
          this.currentUser = { ...updatedUser };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          console.log('Updated bookings:', updatedUser.bookings);
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
      }

      this.currentSection = 'bookings';
      this.showPassengerForm = false;
      this.showHotelBookingForm = false;
    },

    // Authentication logic
    login() {
      if (!this.email || !this.password) {
        alert('Please fill in all fields.');
        return;
      }

      const user = this.users.find(u => u.email === this.email && u.password === this.password);
      if (user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('Login Successful!');
        this.showSearchSection();
      } else {
        alert('Invalid email or password.');
      }
    },

    signup() {
      if (!this.name || !this.email || !this.password) {
        alert('Please fill in all fields.');
        return;
      }

      if (this.password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
      }

      const userExists = this.users.some(u => u.email === this.email);
      if (userExists) {
        alert('Email already registered.');
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: this.name,
        email: this.email,
        password: this.password,
        bookings: []
      };

      this.users.push(newUser);
      localStorage.setItem('users', JSON.stringify(this.users));
      alert('Signup Successful! Please login with your credentials.');
      this.showLoginSection();
    },

    logout() {
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      this.showLoginSection();
    },

    // Fetches flights from backend API
    searchFlights() {
      if (!this.currentUser) {
        alert('Please login first');
        this.showLoginSection();
        return;
      }

      this.isLoading = true;
      this.flights = [];
      this.noFlightsFound = false;

      axios.get("http://localhost:3000/api/flights", {
        params: {
          origin: this.searchParams.origin.toUpperCase(),
          destination: this.searchParams.destination.toUpperCase(),
          date: this.searchParams.date
        },
        timeout: 10000
      })
        .then(response => {
          const flightsData = response.data.flights || response.data;

          if (flightsData && flightsData.length > 0) {
            this.flights = flightsData.map(flight => ({
              ...flight,
              duration: this.formatDuration(flight.duration),
              carbonEmissions: `${flight.carbonEmissions} kg CO₂`
            }));
            this.showResults = true;
          } else {
            this.noFlightsFound = true;
          }
        })
        .catch(error => {
          console.error("Error:", error);
          this.noFlightsFound = true;
          alert("Please try again.");
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    // Fetches hotel data from backend API
    searchHotels() {
      if (!this.currentUser) {
        alert('Please login first');
        this.showLoginSection();
        return;
      }

      this.isLoading = true;
      this.hotels = [];
      this.noHotelsFound = false;

      axios.get("http://localhost:3000/api/hotels", {
        params: {
          location: this.hotelParams.location,
          checkIn: this.hotelParams.checkIn,
          checkOut: this.hotelParams.checkOut,
          guests: this.hotelParams.guests
        }
      })
        .then(response => {
          if (response.data.hotels && response.data.hotels.length > 0) {
            this.hotels = response.data.hotels;
            this.showHotelResults = true;
          } else {
            this.noHotelsFound = true;
          }
        })
        .catch(error => {
          console.error("Error:", error);
          this.noHotelsFound = true;
          alert("Failed to fetch hotels. Please try again.");
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    // Shows flight booking form
    bookFlight(flightId) {
      if (!this.currentUser) {
        alert('Please login first');
        this.showLoginSection();
        return;
      }

      this.selectedFlight = this.flights.find(flight => flight.id === flightId);
      if (this.selectedFlight) {
        this.passenger = {
          firstName: '',
          lastName: '',
          passportNumber: '',
          email: this.currentUser.email,
          seat: ''
        };
        this.showPassengerForm = true;
        this.showHotelBookingForm = false;
      }
    },

    // Submits flight passenger form
    submitPassengerForm() {
      if (!this.passenger.seat) {
        alert('Please select a seat.');
        return;
      }

      const booking = {
        type: 'flight',
        id: Date.now().toString(),
        item: { ...this.selectedFlight },
        passenger: { ...this.passenger },
        bookingDate: new Date().toISOString(),
        checkIn: this.searchParams.date,
        checkOut: this.searchParams.date
      };

      this.saveBooking(booking);

      alert(`Flight booking confirmed for ${this.passenger.firstName} ${this.passenger.lastName}!\n` +
        `Flight: ${this.selectedFlight.airline} #${this.selectedFlight.flightNumber}\n` +
        `Seat: ${this.passenger.seat}`);

      this.showPassengerForm = false;
      this.showBookingsSection();
    },

    // Shows hotel booking form
    showHotelBooking(hotel) {
      this.selectedHotel = hotel;
      this.hotelPassenger = {
        firstName: '',
        lastName: '',
        passportNumber: '',
        email: this.currentUser.email,
        roomType: 'Standard'
      };
      this.showHotelBookingForm = true;
      this.showPassengerForm = false;
    },

    // Cancels hotel booking flow
    cancelHotelBooking() {
      this.showHotelBookingForm = false;
      this.selectedHotel = null;
    },

    // Submits hotel booking
    submitHotelBooking() {
      if (!this.selectedHotel) return;

      const booking = {
        type: 'hotel',
        id: Date.now().toString(),
        item: { ...this.selectedHotel },
        passenger: { ...this.hotelPassenger },
        checkIn: this.hotelParams.checkIn,
        checkOut: this.hotelParams.checkOut,
        bookingDate: new Date().toISOString()
      };

      this.saveBooking(booking);

      alert(`Hotel booking confirmed for ${this.hotelPassenger.firstName} ${this.hotelPassenger.lastName}!\n` +
        `Hotel: ${this.selectedHotel.name}\n` +
        `Room Type: ${this.hotelPassenger.roomType}\n` +
        `Check-in: ${this.hotelParams.checkIn} to ${this.hotelParams.checkOut}`);

      this.showHotelBookingForm = false;
      this.showBookingsSection();
    },

    // Saves booking to user's booking list and updates localStorage
    saveBooking(booking) {
      try {
        const bookingCopy = JSON.parse(JSON.stringify(booking));
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);

        if (userIndex !== -1) {
          if (!this.users[userIndex].bookings) {
            this.users[userIndex].bookings = [];
          }

          this.users[userIndex].bookings.push(bookingCopy);
          localStorage.setItem('users', JSON.stringify(this.users));

          this.currentUser = { ...this.users[userIndex] };
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

          this.$forceUpdate();
          console.log('Booking saved:', bookingCopy);
        }
      } catch (error) {
        console.error('Error saving booking:', error);
        alert('Failed to save booking. Please try again.');
      }
    },

    // Helper function for formatting dates and times
    formatTime(timeString) {
      if (!timeString) return '';
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    formatDuration(minutes) {
      if (!minutes) return '';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    },

    // Resets form fields and state
    clearData() {
      this.email = '';
      this.password = '';
      this.name = '';
      this.searchParams = {
        origin: '',
        destination: '',
        date: '',
        maxPrice: 1000
      };
      this.hotelParams = {
        location: '',
        checkIn: '',
        checkOut: '',
        guests: 2,
        maxPrice: 500,
        stars: 0,
        amenities: []
      };
      this.flights = [];
      this.hotels = [];
      this.showResults = false;
      this.showHotelResults = false;
      this.noFlightsFound = false;
      this.noHotelsFound = false;
      this.showPassengerForm = false;
      this.showHotelBookingForm = false;
    }
  },

  // Refirects logged-in user to flight search section
  mounted() {
    if (this.currentUser) {
      this.showSearchSection();
    }
  }
});

app.mount('#app');
