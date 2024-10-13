import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ApexCharts from 'react-apexcharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

interface BookingData {
  arrival_date_year: string;
  arrival_date_month: string;
  arrival_date_day_of_month: string;
  adults: string;
  children: string;
  babies: string;
  country: string;
}

const App: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch data from backend API
    axios.get('http://localhost:5000/api/bookings')
      .then((response) => {
        setBookings(response.data);
        setFilteredBookings(response.data); // Initially display all data
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  // Filter bookings based on selected date range
  const filterByDateRange = () => {
    if (startDate && endDate) {
      const filtered = bookings.filter((booking) => {
        const bookingDate = new Date(
          parseInt(booking.arrival_date_year),
          parseInt(booking.arrival_date_month) - 1,
          parseInt(booking.arrival_date_day_of_month)
        );
        return bookingDate >= startDate && bookingDate <= endDate;
      });
      setFilteredBookings(filtered);
    }
  };

  useEffect(() => {
    filterByDateRange();
  }, [startDate, endDate, bookings]);

  // Data for charts
  const getVisitorsPerDay = () => {
    // Aggregate number of visitors per day
    const visitorsPerDay = filteredBookings.reduce((acc: any, booking) => {
      const dateKey = `${booking.arrival_date_year}-${booking.arrival_date_month}-${booking.arrival_date_day_of_month}`;
      const totalVisitors = parseInt(booking.adults) + parseInt(booking.children) + parseInt(booking.babies);

      acc[dateKey] = (acc[dateKey] || 0) + totalVisitors;
      return acc;
    }, {});
    return Object.entries(visitorsPerDay).map(([date, visitors]) => ({ x: date, y: visitors }));
  };

  const getVisitorsPerCountry = () => {
    // Aggregate number of visitors per country
    const visitorsPerCountry = filteredBookings.reduce((acc: any, booking) => {
      const totalVisitors = parseInt(booking.adults) + parseInt(booking.children) + parseInt(booking.babies);
      acc[booking.country] = (acc[booking.country] || 0) + totalVisitors;
      return acc;
    }, {});
    return Object.entries(visitorsPerCountry).map(([country, visitors]) => ({ x: country, y: visitors }));
  };

  return (
    <div className="container">
      <h1>Hotel Booking Dashboard</h1>

      {/* Date Range Picker */}
      <div className="date-picker">
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => setStartDate(date)}
          selectsStart
          startDate={startDate || undefined} // Fix: Convert null to undefined
          endDate={endDate || undefined} // Fix: Convert null to undefined
          placeholderText="Select start date"
        />
        <DatePicker
          selected={endDate}
          onChange={(date: Date | null) => setEndDate(date)}
          selectsEnd
          startDate={startDate || undefined}
          endDate={endDate || undefined}
          placeholderText="Select end date"
        />
      </div>

      {/* Chart Section */}
      <div className="chart-container">
        {/* Time Series Chart - Visitors Per Day */}
        <div className="chart-box">
          <h2>Visitors Per Day</h2>
          <ApexCharts
            type="line"
            series={[{ name: 'Visitors', data: getVisitorsPerDay() }]}
            options={{
              chart: {
                id: 'visitors-per-day',
                zoom: { enabled: true },
              },
              xaxis: {
                type: 'category',
                title: { text: 'Date' },
              },
              yaxis: { title: { text: 'Number of Visitors' } },
            }}
            width="100%"
            height="300"
          />
        </div>

        {/* Column Chart - Visitors Per Country */}
        <div className="chart-box">
          <h2>Visitors Per Country</h2>
          <ApexCharts
            type="bar"
            series={[{ name: 'Visitors', data: getVisitorsPerCountry() }]}
            options={{
              chart: { id: 'visitors-per-country' },
              xaxis: { type: 'category', title: { text: 'Country' } },
              yaxis: { title: { text: 'Number of Visitors' } },
            }}
            width="100%"
            height="300"
          />
        </div>
      </div>

      {/* Sparkline Charts Section */}
      <div className="sparkline-container">
        {/* Sparkline Chart - Adult Visitors */}
        <div className="sparkline-box">
          <h3>Adult Visitors</h3>
          <ApexCharts
            type="line"
            series={[{
              name: 'Adults',
              data: filteredBookings.map(booking => parseInt(booking.adults))
            }]}
            options={{
              chart: { sparkline: { enabled: true } },
              title: { text: `Total Adults: ${filteredBookings.reduce((acc, booking) => acc + parseInt(booking.adults), 0)}` },
              xaxis: { type: 'category' },
            }}
            width="100%"
            height="150"
          />
          <div className="total">
            Total Adults: {filteredBookings.reduce((acc, booking) => acc + parseInt(booking.adults), 0)}
          </div>
        </div>

        {/* Sparkline Chart - Children Visitors */}
        <div className="sparkline-box">
          <h3>Children Visitors</h3>
          <ApexCharts
            type="line"
            series={[{
              name: 'Children',
              data: filteredBookings.map(booking => parseInt(booking.children))
            }]}
            options={{
              chart: { sparkline: { enabled: true } },
              title: { text: `Total Children: ${filteredBookings.reduce((acc, booking) => acc + parseInt(booking.children), 0)}` },
              xaxis: { type: 'category' },
            }}
            width="100%"
            height="150"
          />
          <div className="total">
            Total Children: {filteredBookings.reduce((acc, booking) => acc + parseInt(booking.children), 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
