const db = require('../config/dbConfig'); // Import the connection pool
const xlsx = require('xlsx');

// Load Excel file
const filePath = 'BillboardData.xlsx';
const workbook = xlsx.readFile(filePath);
const brandsSheet = xlsx.utils.sheet_to_json(workbook.Sheets['Brands']);
const mediaSheet = xlsx.utils.sheet_to_json(workbook.Sheets['Media']);

// Insert data into BrandData table
async function populateBrandData(connection) {
  console.log('Populating BrandData...');
  const query = `
    INSERT INTO BrandData (
      qr_code_id, campaign_name, brand_name, subbrand, category, product,
      media_agency, producer, distributor, ad_language, url
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const row of brandsSheet) {
    const values = [
      row['QR CODE'] || null,
      row['Ad'] || null,
      row['Brand'] || null,
      row['Subbrand'] || null,
      row['Category'] || null,
      row['Product'] || null,
      row['Media Agency'] || null,
      row['Producer'] || null,
      row['Distributor'] || null,
      row['Language'] || null,
      row['URL'] || null,
    ];

    try {
      await connection.execute(query, values);
    } catch (error) {
      console.error(`Error inserting brand data: ${row['QR CODE'] || 'unknown'}`, error);
    }
  }
  console.log('BrandData populated successfully.');
}

// Insert data into Billboards table
async function populateBillboardData(connection) {
  console.log('Populating Billboards...');
  const query = `
    INSERT INTO Billboards (
      billboard_id, location, billboard_type, submedium, ad_medium, sub_region, zone, competition,
      angle, height, obstruction, shape, visibility, axe, network,
      ad_value_usd, country, region
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const row of mediaSheet) {
    const values = [
      row['Bilb_id'] || null,
      row['Location'] || null,
      row['Media Type'] || null,
      row['Submedium'] || null,
      row['Medium'] || null,
      row['Sub Region'] || null,
      row['Zone'] || null,
      row['Competition'] || null,
      row['Angle'] || null,
      row['Height'] || null,
      row['Obstraction'] || null,
      row['Shape'] || null,
      row['Visibility'] || null,
      row['Axe'] || null,
      row['Network'] || null,
      row['AD VALUE - USD'] || null,
      row['Country'] || null,
      row['Region'] || null,
    ];

    try {
      await connection.execute(query, values);
    } catch (error) {
      console.error(`Error inserting billboard data: ${row['Bilb_id'] || 'unknown'}`, error);
    }
  }
  console.log('Billboards populated successfully.');
}

// Main function to populate the database
async function main() {
  try {
    // Use connection from dbConfig
    const connection = await db.getConnection();

    await populateBrandData(connection); // Populate BrandData table
    await populateBillboardData(connection); // Populate Billboards table

    // Release the connection back to the pool
    connection.release();

    console.log('Database population completed.');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

main();
