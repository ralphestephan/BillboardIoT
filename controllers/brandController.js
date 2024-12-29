const db = require('../config/dbConfig');

// Fetch all brands
const getAllBrands = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM BrandData');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch a specific brand by ID
const getBrandById = async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM BrandData WHERE ad_id = ?', [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new brand
const addBrand = async (req, res) => {
  const { qr_code_id, campaign_name, brand_name, subbrand, category, product, media_agency, producer, distributor, ad_language, url } = req.body;
  try {
    const query = `
      INSERT INTO BrandData (qr_code_id, campaign_name, brand_name, subbrand, category, product, media_agency, producer, distributor, ad_language, url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [qr_code_id, campaign_name, brand_name, subbrand, category, product, media_agency, producer, distributor, ad_language, url]);
    res.status(201).json({ message: 'Brand added successfully', ad_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing brand
const updateBrand = async (req, res) => {
  const { id } = req.params;
  const { qr_code_id, campaign_name, brand_name, subbrand, category, product, media_agency, producer, distributor, ad_language, url } = req.body;
  try {
    const query = `
      UPDATE BrandData
      SET qr_code_id = ?, campaign_name = ?, brand_name = ?, subbrand = ?, category = ?, product = ?, media_agency = ?, producer = ?, distributor = ?, ad_language = ?, url = ?
      WHERE ad_id = ?
    `;
    const [result] = await db.query(query, [qr_code_id, campaign_name, brand_name, subbrand, category, product, media_agency, producer, distributor, ad_language, url, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Brand not found' });
    }
    res.json({ message: 'Brand updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a brand
const deleteBrand = async (req, res) => {
    const { id } = req.params;
    try {
      const query = 'DELETE FROM BrandData WHERE ad_id = ?';
      const [result] = await db.query(query, [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Brand not found' });
      }
      res.json({ message: 'Brand deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  module.exports = {
    getAllBrands,
    getBrandById,
    addBrand,
    updateBrand,
    deleteBrand,
  };