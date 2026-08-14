// Camera Capture & BeReal-style Watermark Canvas Engine

export class CameraEngine {
  constructor(videoElement, canvasElement) {
    this.video = videoElement;
    this.canvas = canvasElement;
    this.stream = null;
    this.facingMode = 'environment'; // default rear camera
  }

  async startStream() {
    this.stopStream();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });
      if (this.video) {
        this.video.srcObject = this.stream;
        await this.video.play();
        return true;
      }
    } catch (err) {
      console.warn('Camera access not available or denied:', err);
      return false;
    }
  }

  toggleFacingMode() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    return this.startStream();
  }

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  captureFrame(userName, userCity) {
    if (!this.video || !this.canvas) return null;

    const width = this.video.videoWidth || 640;
    const height = this.video.videoHeight || 480;

    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');

    // Draw camera image
    ctx.drawImage(this.video, 0, 0, width, height);

    // Apply Watermark Overlay
    this._applyWatermark(ctx, width, height, userName, userCity);

    return this.canvas.toDataURL('image/jpeg', 0.88);
  }

  processUploadedImage(imgElement, userName, userCity) {
    if (!this.canvas) return null;

    const width = imgElement.naturalWidth || 640;
    const height = imgElement.naturalHeight || 480;

    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');

    ctx.drawImage(imgElement, 0, 0, width, height);
    this._applyWatermark(ctx, width, height, userName, userCity);

    return this.canvas.toDataURL('image/jpeg', 0.88);
  }

  _applyWatermark(ctx, width, height, userName, userCity) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('pt-BR');

    // Semi-transparent bottom bar
    const barHeight = Math.max(50, Math.floor(height * 0.12));
    ctx.fillStyle = 'rgba(10, 13, 20, 0.82)';
    ctx.fillRect(0, height - barHeight, width, barHeight);

    // Accent line
    ctx.fillStyle = '#ff2a5f';
    ctx.fillRect(0, height - barHeight, width, 3);

    // Watermark text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.floor(barHeight * 0.35)}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(`📍 ${userCity} • ${userName}`, 16, height - barHeight * 0.52);

    ctx.fillStyle = '#ffb703';
    ctx.font = `bold ${Math.floor(barHeight * 0.32)}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`🕒 ${dateStr} ${timeStr}`, width - 16, height - barHeight * 0.52);

    // Top Stamp
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    ctx.font = `bold ${Math.floor(barHeight * 0.28)}px sans-serif`;
    ctx.fillText('🔴 AO VIVO • BATE-PONTO ESCOLAR', 16, 28);
  }
}
