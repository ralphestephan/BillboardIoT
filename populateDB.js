const mysql = require('mysql2/promise');
const xlsx = require('xlsx');

// Load Excel file
const filePath = 'C:\\Users\\Hello\\Desktop\\Projects\\Billboard iot\\Bilboard data.xlsx';
const workbook = xlsx.readFile(filePath);
const brandsSheet = xlsx.utils.sheet_to_json(workbook.Sheets['Brands']);
const mediaSheet = xlsx.utils.sheet_to_json(workbook.Sheets['Media']);

// MySQL configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Aiypwzqp00',
  database: 'AdsDB',
};

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
      row['QR CODE'],
      row['Ad'],
      row['Brand'],
      row['Subbrand'],
      row['Category'],
      row['Product'],
      row['Media Agency'],
      row['Producer'],
      row['Distributor'],
      row['Language'],
      row['URL'],
    ];
    await connection.execute(query, values);
  }
  console.log('BrandData populated successfully.');
}

async function populateBillboardData(connection) {
    console.log('Populating Billboards...');
    const query = `
      INSERT INTO Billboards (
        billboard_id, location, billboard_type, submedium, ad_medium, sub_region, zone,
        angle, height, obstruction, shape, visibility, axe, network,
        ad_value_usd, country, region
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    for (const row of mediaSheet) {
      const values = [
        row['Bilb_id'] || null,             // Ensure default null for undefined
        row['Location'] || null,
        row['Media Type'] || null,
        row['Submedium'] || null,
        row['Medium'] || null,
        row['Sub Region'] || null,
        row['Zone Competition'] || null,
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
        console.error(`Error inserting billboard: ${row['Bilb_id']}`, error);
      }
    }
    console.log('Billboards populated successfully.');
  }
  
// Main function to populate the database
async function main() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    await populateBrandData(connection);
    await populateBillboardData(connection);
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await connection.end();
    console.log('Database population completed.');
  }
}

main();
