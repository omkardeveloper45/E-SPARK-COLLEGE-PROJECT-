const { getStore } = require('../config/db');

const getStations = async (req, res) => {
  try {
    const { search, connector, status, minKw } = req.query;
    const store = getStore();
    let stations = [...store.stations];

    if (search) {
      const q = search.toLowerCase();
      stations = stations.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
      );
    }

    if (connector) {
      stations = stations.filter(s =>
        s.chargers.some(c => c.type.toLowerCase().includes(connector.toLowerCase()))
      );
    }

    if (status) {
      stations = stations.filter(s => s.status.toLowerCase() === status.toLowerCase());
    }

    if (minKw) {
      const kwVal = parseFloat(minKw);
      stations = stations.filter(s =>
        s.chargers.some(c => c.kw >= kwVal)
      );
    }

    res.json({ success: true, count: stations.length, stations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStationById = async (req, res) => {
  try {
    const store = getStore();
    const station = store.stations.find(s => s._id === req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.json({ success: true, station });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createStation = async (req, res) => {
  try {
    const { name, address, city, pricePerKwh, chargers, image } = req.body;
    if (!name || !address || !city) {
      return res.status(400).json({ success: false, message: 'Station name, address, and city are required' });
    }

    const store = getStore();
    const newStation = {
      _id: 'stn_' + Date.now(),
      name,
      address,
      city,
      location: { lat: 19.076, lng: 72.8777 },
      distance: '3.0 km',
      totalChargers: chargers ? chargers.length : 4,
      availableChargers: chargers ? chargers.length : 4,
      pricePerKwh: parseFloat(pricePerKwh) || 18,
      rating: 4.8,
      image: image || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
      status: 'Available',
      chargers: chargers || [
        { id: 'chg_' + Date.now() + '_1', type: 'CCS2 (DC Fast)', kw: 60, price: 18, status: 'Available' },
        { id: 'chg_' + Date.now() + '_2', type: 'Type 2 (AC)', kw: 22, price: 14, status: 'Available' }
      ]
    };

    store.stations.push(newStation);
    res.status(201).json({ success: true, message: 'Station created successfully', station: newStation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateStation = async (req, res) => {
  try {
    const { id } = req.params;
    const store = getStore();
    const index = store.stations.findIndex(s => s._id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    store.stations[index] = { ...store.stations[index], ...req.body };
    res.json({ success: true, message: 'Station updated successfully', station: store.stations[index] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteStation = async (req, res) => {
  try {
    const { id } = req.params;
    const store = getStore();
    const index = store.stations.findIndex(s => s._id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }

    store.stations.splice(index, 1);
    res.json({ success: true, message: 'Station deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation
};
