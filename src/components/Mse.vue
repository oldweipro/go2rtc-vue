<template>
  <div>
    <video style="width:600px" ref="videoMse" autoplay muted playsinline></video>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const videoMse = ref<HTMLVideoElement | null>(null);
const mseSourceBuffer = ref<SourceBuffer | null>(null);
const mseQueue = ref<Array<ArrayBuffer>>([]);
const mseStreamingStarted = ref(false);

const startPlay = (url: string) => {
  const mse = new MediaSource();
  if (videoMse.value) {
    videoMse.value.src = URL.createObjectURL(mse);
    videoMse.value.play();
    mse.addEventListener("sourceopen", () => {
      const ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";
      ws.onopen = () => {
        ws.send(JSON.stringify({type: 'mse', value: 'avc1.640029,avc1.64002A,avc1.640033,hvc1.1.6.L153.B0,mp4a.40.2,mp4a.40.5,flac,opus'}));
      };
      ws.addEventListener('message', ev => {
        if (typeof ev.data === 'string') {
          const msg = JSON.parse(ev.data);
          mseSourceBuffer.value = mse.addSourceBuffer(msg.value);
          mseSourceBuffer.value.mode = 'segments';
          mseSourceBuffer.value.addEventListener('updateend', pushPacket);
        } else {
          readPacket(ev.data);
        }
      });
    });
  }
};

const pushPacket = () => {
  if (mseSourceBuffer.value && !mseSourceBuffer.value.updating) {
    if (mseQueue.value.length > 0) {
      mseSourceBuffer.value.appendBuffer(mseQueue.value.shift());
    } else {
      mseStreamingStarted.value = false;
    }
  }
  if (videoMse.value && videoMse.value.buffered != null && videoMse.value.buffered.length > 0) {
    if (typeof document.hidden !== "undefined" && document.hidden) {
      videoMse.value.currentTime = videoMse.value.buffered.end(videoMse.value.buffered.length - 1) - 0.5;
    }
  }
};

const readPacket = (packet: ArrayBuffer) => {
  if (!mseStreamingStarted.value && mseSourceBuffer.value) {
    try {
      mseSourceBuffer.value.appendBuffer(packet);
    } catch (e) {
      window.location.reload();
    }
    mseStreamingStarted.value = true;
    return;
  }
  if (mseSourceBuffer.value) {
    mseQueue.value.push(packet);
    if (!mseSourceBuffer.value.updating) {
      pushPacket();
    }
  }
};

onMounted(() => {
  if (videoMse.value) {
    videoMse.value.addEventListener("pause", (event) => {
      if (videoMse.value && videoMse.value.currentTime > videoMse.value.buffered.end(videoMse.value.buffered.length - 1)) {
        if (videoMse.value.buffered) {
          videoMse.value.currentTime = videoMse.value.buffered.end(videoMse.value.buffered.length - 1) - 0.1;
          videoMse.value.play();
        }
      }
    });
    startPlay("ws://192.168.2.30:1984/api/ws?src=hiktest");
  }
});

</script>

<style scoped>

</style>