// Vercel Serverless Function & Cloud / Local Database Handler
// Supports room creation, state retrieval, live syncing between different cities
import fs from 'fs';
import path from 'path';

let memoryRooms = global.__ROOMS_DB__ || {};
global.__ROOMS_DB__ = memoryRooms;

const LOCAL_DB_FILE = path.join(process.cwd(), 'db_rooms.json');

// Helper to load room from database (Vercel KV Cloud or Local File / Memory)
async function getRoomFromDB(roomCode) {
  // 1. Try Vercel KV / Upstash Cloud if environment variables exist
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/room_${roomCode}`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
        }
      }
    } catch (e) {
      console.warn('Vercel KV fetch fallback:', e);
    }
  }

  // 2. Try Local File Store
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const fileData = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf-8'));
      if (fileData[roomCode]) return fileData[roomCode];
    }
  } catch (e) {}

  // 3. Fallback to Memory
  return memoryRooms[roomCode] || null;
}

// Helper to save room to database
async function saveRoomToDB(roomCode, roomData) {
  memoryRooms[roomCode] = roomData;

  // 1. Try Vercel KV / Upstash Cloud
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (kvUrl && kvToken) {
    try {
      await fetch(`${kvUrl}/set/room_${roomCode}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSON.stringify(roomData))
      });
    } catch (e) {
      console.warn('Vercel KV save fallback:', e);
    }
  }

  // 2. Try Local File Store
  try {
    let existing = {};
    if (fs.existsSync(LOCAL_DB_FILE)) {
      existing = JSON.parse(fs.readFileSync(LOCAL_DB_FILE, 'utf-8') || '{}');
    }
    existing[roomCode] = roomData;
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (e) {}

  return roomData;
}

export default async function handler(req, res) {
  // Enable CORS for cross-origin or local dev
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, query, body } = req;
  const roomCode = (query.code || (body && body.code) || '').toUpperCase().trim();

  try {
    // 1. GET Room State
    if (method === 'GET') {
      if (!roomCode) {
        return res.status(400).json({ error: 'Código da sala não fornecido' });
      }

      const room = await getRoomFromDB(roomCode);
      if (!room) {
        return res.status(404).json({ error: 'Sala não encontrada', code: roomCode });
      }

      return res.status(200).json({ success: true, room });
    }

    // 2. POST / PUT: Create or Sync Room State
    if (method === 'POST' || method === 'PUT') {
      const payload = typeof body === 'string' ? JSON.parse(body) : body;
      const targetCode = (payload.code || roomCode || 'SALA-' + Math.random().toString(36).substring(2, 7).toUpperCase());

      if (payload.action === 'CREATE') {
        const newRoom = {
          code: targetCode,
          name: payload.name || 'Bonde Anti-Falta',
          fineAmount: Number(payload.fineAmount) || 5.0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          members: payload.members || [],
          checkins: payload.checkins || [],
          debts: payload.debts || [],
          paymentRequests: payload.paymentRequests || [],
          logs: payload.logs || [
            { text: `Sala ${targetCode} criada! Convide seus amigos para começar.`, time: 'Agora' }
          ]
        };
        await saveRoomToDB(targetCode, newRoom);
        return res.status(201).json({ success: true, room: newRoom });
      }

      if (payload.action === 'SYNC') {
        const existing = await getRoomFromDB(targetCode);
        let mergedRoom = null;

        if (!existing) {
          mergedRoom = {
            ...payload.room,
            updatedAt: new Date().toISOString()
          };
        } else {
          // Merge incoming room data with existing server data
          const memberMap = new Map();
          (existing.members || []).forEach(m => memberMap.set(m.id, m));
          (payload.room.members || []).forEach(m => {
            const current = memberMap.get(m.id);
            memberMap.set(m.id, { ...current, ...m });
          });

          const checkinMap = new Map();
          (existing.checkins || []).forEach(c => checkinMap.set(c.id, c));
          (payload.room.checkins || []).forEach(c => checkinMap.set(c.id, { ...checkinMap.get(c.id), ...c }));

          const debtMap = new Map();
          (existing.debts || []).forEach(d => debtMap.set(d.id, d));
          (payload.room.debts || []).forEach(d => debtMap.set(d.id, { ...debtMap.get(d.id), ...d }));

          mergedRoom = {
            ...existing,
            ...payload.room,
            members: Array.from(memberMap.values()),
            checkins: Array.from(checkinMap.values()),
            debts: Array.from(debtMap.values()),
            updatedAt: new Date().toISOString()
          };
        }

        await saveRoomToDB(targetCode, mergedRoom);
        return res.status(200).json({ success: true, room: mergedRoom });
      }

      // Default save/update
      if (payload.room) {
        const updated = {
          ...payload.room,
          updatedAt: new Date().toISOString()
        };
        await saveRoomToDB(targetCode, updated);
        return res.status(200).json({ success: true, room: updated });
      }

      return res.status(400).json({ error: 'Ação inválida no payload' });
    }

    return res.status(405).json({ error: 'Método não permitido' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ error: 'Erro interno no servidor', message: err.message });
  }
}
