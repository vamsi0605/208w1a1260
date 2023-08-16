const express = require('express');
const axios = require('axios');

const app = express();
const port = 3710;

app.get('/merged-numbers', async (req, res) => {
  const requestedUrls = req.query.urls;

  if (!requestedUrls) {
    return res.status(400).json({ error: 'URLs parameter is missing' });
  }

  const urlArray = Array.isArray(requestedUrls) ? requestedUrls : [requestedUrls];
  const mergedNumbers = [];

  const fetchNumbers = async (url) => {
    try {
      const response = await axios.get(url);

      if (response.status === 200 && response.data && Array.isArray(response.data.numbers)) {
        return response.data.numbers;
      } else {
        console.error(`Invalid response from ${url}`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching data from ${url}: ${error.message}`);
      return [];
    }
  };

  try {
    const promises = urlArray.map(fetchNumbers);

    Promise.all(promises)
      .then((responses) => {
        const allNumbers = responses.flat();
        allNumbers.forEach((number) => {
          if (!mergedNumbers.includes(number)) {
            mergedNumbers.push(number);
          }
        });

        mergedNumbers.sort((a, b) => a - b);
        res.json({ mergedNumbers });
      })
      .catch((error) => {
        console.error('Error processing responses:', error);
        res.status(500).json({ error: 'An error occurred while processing data' });
      });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
