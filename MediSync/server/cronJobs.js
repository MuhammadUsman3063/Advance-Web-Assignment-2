const cron = require('node-cron');
const Patient = require('./models/Patient');
const PatientHistory = require('./models/PatientHistory');

// Yahan humne (io) parameter add kiya hai
const startCronJobs = (io) => { 
  
  cron.schedule('0 0 * * *', async () => { // Testing ke liye 1 min par rakha hai
    console.log('⏳ [CRON] Starting Midnight System Maintenance...');
    
    try {
      const allPatients = await Patient.find({});

      if (allPatients.length > 0) {
        const historyData = allPatients.map(p => ({
          name: p.name,
          phone: p.phone,
          tokenNumber: p.tokenNumber,
          status: p.status === 'Completed' ? 'Completed' : 'Auto-Closed', 
          originalDate: p.createdAt,
        }));

        await PatientHistory.insertMany(historyData);
        await Patient.deleteMany({});
        
        console.log(`✅ [CRON] Maintenance Complete: Archived ${allPatients.length} patients and Reset Queue to #1.`);
        
        // --- NAYA CODE: LIVE SYNC SIGNAL ---
        // Jaise hi safai ho jaye, sab screens ko update ka signal bhej do
        if (io) {
          console.log('🔄 [CRON] Broadcasting queue_refreshed to all screens...');
          io.emit('queue_refreshed');
        }
        // ------------------------------------

      } else {
        console.log('✅ [CRON] No patients found today. Queue is already clean.');
      }
    } catch (error) {
      console.error('❌ [CRON] Error during midnight maintenance:', error);
    }
  });
};

module.exports = startCronJobs;