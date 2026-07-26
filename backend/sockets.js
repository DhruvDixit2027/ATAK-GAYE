// Socket.IO ka core logic yahan hai — sabse important concept "rooms" hai:
// har request (ek user + ek helper ka jodaa) ke liye ek room banta hai,
// naam hota hai `request:<requestId>`. User aur uska helper dono usi room
// me judte hain, isliye jo bhi ek bheje, sirf dusra hi turant paata hai —
// baaki sab requests/users ko kuch nahi milta.

let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // User app ye call karta hai jab tracking screen khulti hai
    socket.on('join:request', (requestId) => {
      if (!requestId) return;
      socket.join(`request:${requestId}`);
      console.log(`👤 Socket ${socket.id} joined room request:${requestId}`);
    });

    // Helper app ye call karta hai — jab bhi uski location change ho
    // (GPS se watchPosition ke through) — { requestId, lat, lng }
    socket.on('helper:location', ({ requestId, lat, lng }) => {
      if (!requestId || lat == null || lng == null) return;
      // Sirf isi request ke room me bhejo — dusre users ko nahi
      io.to(`request:${requestId}`).emit('location:update', { lat, lng });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });
  });
}

// Route handlers (jaise requestRoutes.js ke accept/reject endpoints) isko
// use karke turant status-change bhej sakte hain, bina user ko poll kiye
function emitRequestStatus(requestId, status) {
  if (!ioInstance) return;
  ioInstance.to(`request:${requestId}`).emit('status:update', { status });
}

module.exports = { initSocket, emitRequestStatus };