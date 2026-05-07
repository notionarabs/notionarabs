require('dotenv').config();
const supabase = require('./utils/supabase');
const crypto = require('crypto');

async function backfill() {
  const creatorId = '30663edd6404be4645d20bc9';
  
  // 1. Create a log for Fajr Tracker
  const log1 = {
    id: crypto.randomBytes(12).toString('hex'),
    templateId: '6eb906995740fddf90958619',
    creatorId: creatorId,
    userId: 'c1aef1f8893fad00b5a0bf20',
    userEmailSnapshot: 'hazemyasserprg@gmail.com',
    templateTitleSnapshot: 'Fajr Tracker',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    referrer: 'https://notion-arabs.com/templates',
    createdAt: '2026-05-07T12:15:00'
  };

  // 2. Create a log for Azkar Hub
  const log2 = {
    id: crypto.randomBytes(12).toString('hex'),
    templateId: 'ded95cb6f632f7c779ed87de',
    creatorId: creatorId,
    userId: '09e34c61ae25528fa339c236',
    userEmailSnapshot: 'hazemyasser911@gmail.com',
    templateTitleSnapshot: 'Azkar Hub | V1.0',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    referrer: 'https://notion-arabs.com/templates/azkar-hub',
    createdAt: '2026-05-07T14:40:00'
  };

  const { data: d1, error: e1 } = await supabase.from('DownloadLog').insert([log1]).select();
  if (e1) {
    console.error('Error inserting log 1:', e1);
  } else {
    console.log('Inserted log 1:', d1);
  }

  const { data: d2, error: e2 } = await supabase.from('DownloadLog').insert([log2]).select();
  if (e2) {
    console.error('Error inserting log 2:', e2);
  } else {
    console.log('Inserted log 2:', d2);
  }
}

backfill();
