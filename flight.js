const app = Vue.createApp({
  data() {
    return {
      currentSection: 'login', // Tracks the current section
      email: '',
      password: '',
      name: '',
      rememberMe: false,
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
      noFlightsInPriceRange: false,
      isLoading: false,
      selectedFlight: null,
      showPassengerForm: false,
      passenger: {
        firstName: '',
        lastName: '',
        passportNumber: '',
        email: '',
        seat: '' // Added seat property
      },
      availableSeats: [
        { row: 1, seats: ["1A", "1B", "", "1C", "1D"] },
        { row: 2, seats: ["2A", "2B", "", "2C", "2D"] },
        { row: 3, seats: ["3A", "3B", "", "3C", "3D"] },
        { row: 4, seats: ["4A", "4B", "", "4C", "4D"] },
        { row: 5, seats: ["5A", "5B", "", "5C", "5D"] },
      ],
      

      // Hotel-related data
      hotelSearchParams: {
        location: '',
        checkin: '',
        checkout: '',
        guests: 1
      },
      hotelResults: [],
      hotelSearchPerformed: false,
      showHotelPassengerForm: false,
      hotelPassenger: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      selectedHotel: null,

      // Car-related data
      carSearchParams: {
        pickupLocation: '',
        pickupDate: '',
        carType: 'basic' // Default to 'basic'
      },
      carResults: [],
      carSearchPerformed: false,
      showCarPassengerForm: false,
      carPassenger: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        licenseNumber: ''
      },
      selectedCar: null,

      // Mock data
      mockHotels: [
        {
          id: 1,
          name: "THE WEST",
          rating: 4.5,
          location: "London",
          price: 200,
          availableDates: ["2025-06-01", "2025-06-02", "2025-06-03", "2025-06-04", "2025-06-05", "2025-06-06", "2025-06-07"]
        },
        {
          id: 2,
          name: "PAN KING",
          rating: 4.8,
          location: "London",
          price: 350,
          availableDates: ["2025-06-01", "2025-06-02", "2025-06-03", "2025-06-04", "2025-06-05", "2025-06-06", "2025-06-07"]
        },
        {
          id: 3,
          name: "KINGS",
          rating: 4.2,
          location: "London",
          price: 150,
          availableDates: ["2025-06-01", "2025-06-02", "2025-06-03", "2025-06-04", "2025-06-05", "2025-06-06", "2025-06-07"]
        },
        {
          id: 4,
          name: "PLAZA INN",
          rating: 4.7,
          location: "Tokyo",
          price: 250,
          availableDates: ["2025-06-01", "2025-06-02", "2025-06-03", "2025-06-04", "2025-06-05", "2025-06-06", "2025-06-07"]
        },
        {
          id: 5,
          name: "PARADISE",
          rating: 4.6,
          location: "Tokyo",
          price: 300,
          availableDates: ["2025-06-01", "2025-06-02", "2025-06-03", "2025-06-04", "2025-06-05", "2025-06-06", "2025-06-07"]
        },
        {
          id: 6,
          name: "SHUVO",
          rating: 4.9,
          location: "Tokyo",
          price: 400,
          availableDates: ["2025-06-01", "2025-06-02", "2025-06-03", "2025-06-04", "2025-06-05", "2025-06-06", "2025-06-07"]
        }
      ],
      mockCars: [
        {
          id: 1,
          company: "Regal",
          model: "Toyota Corolla",
          type: "basic",
          price: 45,
          location: "London",
          availableDates: ["2025-06-01", "2025-06-02", "2025-06-03", "2025-06-04", "2025-06-05", "2025-06-06", "2025-06-07"]
        },
        {
          id: 2,
          company: "Bold",
          model: "BMW 3 series",
          type: "luxury",
          price: 75,
          location: "London",
          availableDates: ["2025-06-01", "2025-06-02", "2025-06-03", "2025-06-04", "2025-06-05", "2025-06-06", "2025-06-07"]
        },
        {
          id: 3,
          company: "Otak",
          model: "BYD",
          type: "green",
          price: 150,
          location: "london",
          availableDates: ["2025-06-01", "2025-06-02", "2025-06-03", "2025-06-04", "2025-06-05", "2025-06-06", "2025-06-07"]
        }
      ]
    };
  },
  computed: {
    filteredFlights() {
      let flights = this.flights.filter(flight => flight.price <= this.searchParams.maxPrice);
      if (this.sortBy === 'price') {
        flights.sort((a, b) => a.price - b.price);
      } else if (this.sortBy === 'duration') {
        flights.sort((a, b) => a.duration - b.duration);
      } else if (this.sortBy === 'airline') {
        flights.sort((a, b) => a.name.localeCompare(b.name));
      }
      return flights;
    }
  },
  methods: {
    showLoginSection() {
      this.currentSection = 'login';
      this.clearData();
    },
    showSignupSection() {
      this.currentSection = 'signup';
      this.clearData();
    },
    showForgotPasswordSection() {
      this.currentSection = 'forgot-password';
      this.clearData();
    },
    showSearchSection() {
      this.currentSection = 'search';
      this.showResults = false;
      this.showPassengerForm = false;
    },
    showHotelsSection() {
      this.currentSection = 'hotels';
      this.hotelResults = [];
      this.hotelSearchPerformed = false;
      this.showPassengerForm = false;
      this.showHotelPassengerForm = false; // Reset hotel form visibility
    },
    showCarsSection() {
      this.currentSection = 'cars';
      this.carResults = [];
      this.carSearchPerformed = false;
      this.showPassengerForm = false;
      this.showCarPassengerForm = false; // Reset car form visibility
    },
    guestLogin() {
      alert('Guest Login Successful!');
      this.showSearchSection();
    },
    login() {
      if (!this.email || !this.password) {
        alert('Please fill in all fields.');
        return;
      }
      console.log('Login Attempt:', { email: this.email, password: this.password });
      alert('Login Successful!');
      this.showSearchSection();
    },
    signup() {
      if (!this.name || !this.email || !this.password) {
        alert('Please fill in all fields.');
        return;
      }
      console.log('Signup Attempt:', { name: this.name, email: this.email, password: this.password });
      alert('Signup Successful!');
      this.showLoginSection();
    },
    resetPassword() {
      if (!this.email) {
        alert('Please enter your email.');
        return;
      }
      console.log('Reset Password Attempt:', { email: this.email });
      alert('Password reset instructions sent to your email.');
    },
    searchFlights() {
      this.isLoading = true;
      axios.get('http://localhost:3000/flights', { params: this.searchParams })
        .then(response => {
          this.flights = response.data;
          this.showResults = true;
          this.currentSection = 'results';
          this.noFlightsFound = this.flights.length === 0;
        })
        .catch(error => {
          console.error('Error fetching flights:', error);
          alert('Failed to fetch flights. Please try again later.');
          this.noFlightsFound = true;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    bookFlight(flightId) {
      this.selectedFlight = this.flights.find(flight => flight.id === flightId);
      if (this.selectedFlight) {
        this.showPassengerForm = true;
      }
    },
    submitPassengerForm() {
      if (!this.passenger.seat) {
        alert('Please select a seat.');
        return;
      }
      alert(`Passenger ${this.passenger.firstName} ${this.passenger.lastName} booked successfully! Seat: ${this.passenger.seat}`);
      this.showPassengerForm = false;
      this.passenger = { firstName: '', lastName: '', passportNumber: '', email: '', seat: '' };
    },
    clearData() {
      this.email = '';
      this.password = '';
      this.name = '';
      this.searchParams.origin = '';
      this.searchParams.destination = '';
      this.searchParams.date = '';
      this.searchParams.maxPrice = 1000;
      this.flights = [];
      this.showResults = false;
      this.noFlightsFound = false;
      this.showPassengerForm = false;
    },
    // Hotel methods
    searchHotels() {
      this.hotelSearchPerformed = true;
      setTimeout(() => {
        this.hotelResults = this.mockHotels.filter(hotel =>
          hotel.location.toLowerCase().includes(this.hotelSearchParams.location.toLowerCase()) &&
          hotel.price <= 500 &&
          hotel.availableDates.includes(this.hotelSearchParams.checkin) &&
          hotel.availableDates.includes(this.hotelSearchParams.checkout)
        );
      }, 500);
    },
    bookHotel(hotelId) {
      if (this.currentSection === 'hotels') {
        this.selectedHotel = this.mockHotels.find(h => h.id === hotelId);
        if (this.selectedHotel) {
          this.showHotelPassengerForm = true;
        }
      }
    },
    submitHotelPassengerForm() {
      if (this.currentSection === 'hotels') {
        alert(`Booking confirmed at ${this.selectedHotel.name} for ${this.hotelPassenger.firstName} ${this.hotelPassenger.lastName}!`);
        this.showHotelPassengerForm = false;
        this.hotelPassenger = { firstName: '', lastName: '', email: '', phone: '' };
      }
    },
    // Car methods
    searchCars() {
      this.carSearchPerformed = true;
      setTimeout(() => {
        this.carResults = this.mockCars.filter(car =>
          car.type === this.carSearchParams.carType &&
          car.location.toLowerCase().includes(this.carSearchParams.pickupLocation.toLowerCase()) &&
          car.availableDates.includes(this.carSearchParams.pickupDate)
        );
      }, 500);
    },
    bookCar(carId) {
      if (this.currentSection === 'cars') {
        this.selectedCar = this.mockCars.find(c => c.id === carId);
        if (this.selectedCar) {
          this.showCarPassengerForm = true;
        }
      }
    },
    submitCarPassengerForm() {
      if (this.currentSection === 'cars') {
        alert(`Booking confirmed: ${this.selectedCar.model} from ${this.selectedCar.company} for ${this.carPassenger.firstName} ${this.carPassenger.lastName}!`);
        this.showCarPassengerForm = false;
        this.carPassenger = { firstName: '', lastName: '', email: '', phone: '', licenseNumber: '' };
      }
    }
  }
});

app.mount('#app');