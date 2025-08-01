const { Region, Subregion, District, ConstituencyMunicipality, SubcountyDivision, ParishWard, VillageCell, sequelize } = require('../models');

async function validateAdminUnits() {
  try {
    console.log('🏛️ Administrative Units Validation');
    console.log('='.repeat(50));
    
    // Check regions
    const regions = await Region.findAll({ raw: true });
    console.log(`📍 Regions: ${regions.length} found`);
    regions.slice(0, 5).forEach(region => {
      console.log(`  - ${region.name} (ID: ${region.id})`);
    });
    if (regions.length > 5) console.log(`  ... and ${regions.length - 5} more`);
    
    // Check subregions
    const subregions = await Subregion.findAll({ raw: true });
    console.log(`\n📍 Subregions: ${subregions.length} found`);
    subregions.slice(0, 5).forEach(subregion => {
      console.log(`  - ${subregion.name} (ID: ${subregion.id})`);
    });
    if (subregions.length > 5) console.log(`  ... and ${subregions.length - 5} more`);
    
    // Check districts
    const districts = await District.findAll({ raw: true });
    console.log(`\n📍 Districts: ${districts.length} found`);
    
    // Look specifically for Kalangala
    const kalangala = districts.filter(d => d.name.toLowerCase().includes('kalangala'));
    if (kalangala.length > 0) {
      console.log(`✅ Kalangala districts found:`);
      kalangala.forEach(district => {
        console.log(`  - ${district.name} (ID: ${district.id}, SubregionID: ${district.subregionId})`);
      });
    } else {
      console.log(`❌ No Kalangala districts found`);
      console.log(`📋 Available districts (first 10):`);
      districts.slice(0, 10).forEach(district => {
        console.log(`  - ${district.name} (ID: ${district.id})`);
      });
    }
    
    // Check constituencies
    const constituencies = await ConstituencyMunicipality.findAll({ raw: true });
    console.log(`\n📍 Constituencies/Municipalities: ${constituencies.length} found`);
    
    // Check subcounties
    const subcounties = await SubcountyDivision.findAll({ raw: true });
    console.log(`📍 Subcounties/Divisions: ${subcounties.length} found`);
    
    // Check parishes
    const parishes = await ParishWard.findAll({ raw: true });
    console.log(`📍 Parishes/Wards: ${parishes.length} found`);
    
    // Check villages
    const villages = await VillageCell.findAll({ raw: true });
    console.log(`📍 Villages/Cells: ${villages.length} found`);
    
    // Look for Kalangala-related units
    console.log(`\n🔍 Kalangala-related administrative units:`);
    
    const kalangalaSubcounties = subcounties.filter(s => 
      s.name.toLowerCase().includes('kalangala')
    );
    if (kalangalaSubcounties.length > 0) {
      console.log(`✅ Kalangala subcounties:`);
      kalangalaSubcounties.forEach(sub => {
        console.log(`  - ${sub.name} (ID: ${sub.id})`);
      });
    }
    
    const kalangalaParishes = parishes.filter(p => 
      p.name.toLowerCase().includes('kalangala')
    );
    if (kalangalaParishes.length > 0) {
      console.log(`✅ Kalangala parishes:`);
      kalangalaParishes.forEach(parish => {
        console.log(`  - ${parish.name} (ID: ${parish.id})`);
      });
    }
    
    const kalangalaVillages = villages.filter(v => 
      v.name.toLowerCase().includes('kalangala')
    );
    if (kalangalaVillages.length > 0) {
      console.log(`✅ Kalangala villages:`);
      kalangalaVillages.forEach(village => {
        console.log(`  - ${village.name} (ID: ${village.id})`);
      });
    }
    
    // Recommendations
    console.log(`\n💡 Recommendations:`);
    if (kalangala.length === 0) {
      console.log(`❌ You need to add Kalangala district to the database first`);
    }
    if (kalangalaSubcounties.length === 0) {
      console.log(`⚠️ Consider adding Kalangala subcounties to the database`);
    }
    if (kalangalaParishes.length === 0) {
      console.log(`⚠️ Consider adding Kalangala parishes to the database`);
    }
    if (kalangalaVillages.length === 0) {
      console.log(`⚠️ Consider adding Kalangala villages to the database`);
    }
    
    if (kalangala.length > 0 && kalangalaSubcounties.length > 0 && 
        kalangalaParishes.length > 0 && kalangalaVillages.length > 0) {
      console.log(`✅ All Kalangala administrative units appear to be ready!`);
    }
    
  } catch (error) {
    console.error('❌ Error validating admin units:', error);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

// Run validation
validateAdminUnits();
