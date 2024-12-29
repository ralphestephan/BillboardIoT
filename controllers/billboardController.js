const db = require('../config/dbConfig');

// Fetch all billboards
const getAllBillboards = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM Billboards');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch a specific billboard by ID
const getBillboardById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM Billboards WHERE billboard_id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Billboard not found' });
    }
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new billboard
const addBillboard = async (req, res) => {
  const { billboard_id, location, billboard_type, submedium, ad_medium, sub_region, zone, angle, height, obstruction, shape, visibility, axe, network, ad_value_usd, country, region } = req.body;
  try {
    const query = `
      INSERT INTO Billboards (billboard_id, location, billboard_type, submedium, ad_medium, sub_region, zone, angle, height, obstruction, shape, visibility, axe, network, ad_value_usd, country, region)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(query, [billboard_id, location, billboard_type, submedium,ad_medium, sub_region, zone, angle, height, obstruction, shape, visibility, axe, network, ad_value_usd, country, region]);
    res.status(201).json({ message: 'Billboard added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing billboard
const updateBillboard = async (req, res) => {
  const { id } = req.params;
  const { location, billboard_type, submedium, ad_medium, sub_region, zone, angle, height, obstruction, shape, visibility, axe, network, ad_value_usd, country, region } = req.body;
  try {
    const query = `
      UPDATE Billboards
      SET location = ?, billboard_type = ?, submedium = ?, ad_medium = ?, sub_region = ?, zone = ?, angle = ?, height = ?, obstruction = ?, shape = ?, visibility = ?, axe = ?, network = ?, ad_value_usd = ?, country = ?, region = ?
      WHERE billboard_id = ?
    `;
    const [result] = await db.query(query, [location, billboard_type, submedium, ad_medium, sub_region, zone, angle, height, obstruction, shape, visibility, axe, network, ad_value_usd, country, region, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Billboard not found' });
    }
    res.json({ message: 'Billboard updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a billboard
const deleteBillboard = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM Billboards WHERE billboard_id = ?';
    const [result] = await db.query(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Billboard not found' });
    }
    res.json({ message: 'Billboard deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllBillboards,
  getBillboardById,
  addBillboard,
  updateBillboard,
  deleteBillboard,
};
