// Socket.IO ka core logic yahan hai — sabse important concept "rooms" hai:
// har request (ek user + ek helper ka jodaa) ke liye ek room banta hai,
// naam hota hai `request:<requestId>`. User aur uska helper dono usi room
// me judte hain, isliye jo bhi ek bheje, sirf dusra hi turant paata hai —
// baaki sab requests/users ko kuch nahi milta.
//
// 👇 NAYA: Broadcast model ke liye ek naya room type add kiya — `helper:<helperId>`.
// Har helper apne is personal room mein join karta hai (login/home khulte hi),
// taaki jab bhi naya request use candidate list mein aaye, turant notification
// mil sake — aur agar koi doosra helper pehle accept kar le, to "taken" event
// bhi turant mil jaaye (list se hata sake).

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

    // 👇 NAYA: Helper app ye call karta hai jab helper login kare ya home screen khole
    socket.on('join:helper', (helperId) => {
      if (!helperId) return;
      socket.join(`helper:${helperId}`);
      console.log(`🔧 Socket ${socket.id} joined room helper:${helperId}`);
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

// 👇 NAYA: Naya request create hote hi, sabhi candidate helpers ko turant notification
function emitNewRequestToHelpers(helperIds, requestData) {
  if (!ioInstance) return;
  helperIds.forEach((helperId) => {
    ioInstance.to(`helper:${helperId}`).emit('new:request', requestData);
  });
}

// 👇 NAYA: Jab ek helper accept kar le, baaki candidate helpers ko batao ye request ab nahi hai
function emitRequestTaken(helperIds, requestId) {
  if (!ioInstance) return;
  helperIds.forEach((helperId) => {
    ioInstance.to(`helper:${helperId}`).emit('request:taken', { requestId });
  });
}

module.exports = { initSocket, emitRequestStatus, emitNewRequestToHelpers, emitRequestTaken };