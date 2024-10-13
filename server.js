const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const cors = require('cors');
const path = require('path');  // To handle file paths

const app = express();
app.use(cors());

// Route to get hotel bookings data
app.get('/api/bookings', (req, res) => {
  const results = [];
  const csvFilePath = path.join(__dirname, 'hotel_bookings_1000.csv'); // Ensure correct path handling

  // Check if the file exists
  fs.access(csvFilePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('CSV file not found:', err);
      return res.status(404).json({ error: 'CSV file not found' });
    }

    // Proceed to read the file if it exists
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => {
        try {
          results.push(data);
        } catch (error) {
          console.error('Error processing data:', error);
        }
      })
      .on('end', () => {
        res.status(200).json(results);
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        res.status(500).json({ error: 'Error reading CSV file' });
      });
  });
});

// Start the server and listen on port 5000
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
