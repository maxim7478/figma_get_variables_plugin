<template>
  <div class="container">
    <h2>🎨 Export Figma Variables → CSS</h2>

    <button @click="exportCSS" :disabled="loading">
      {{ loading ? '⏳ Exporting...' : '📥 Export CSS Variables' }}
    </button>

    <div v-if="error" class="error">❌ {{ error }}</div>

    <div v-if="cssOutput" class="result">
      <h3>📋 Generated CSS:</h3>
      <textarea v-model="cssOutput" readonly></textarea>
      <button @click="copyToClipboard">📋 Copy to Clipboard</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const loading = ref(false);
const cssOutput = ref('');
const error = ref('');

const exportCSS = () => {
  loading.value = true;
  error.value = '';
  cssOutput.value = '';
  parent.postMessage({ pluginMessage: { type: 'export-css' } }, '*');
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(cssOutput.value);
  alert('✅ Copied to clipboard!');
};

window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  loading.value = false;

  if (msg.type === 'css-result') {
    cssOutput.value = msg.css;
  } else if (msg.type === 'error') {
    error.value = msg.message;
  }
};
</script>

<style scoped>
.container {
  padding: 16px;
  font-family: sans-serif;
}
h2 {
  margin-bottom: 12px;
}
button {
  padding: 8px 16px;
  margin-top: 10px;
  cursor: pointer;
}
textarea {
  width: 100%;
  height: 250px;
  margin-top: 10px;
  font-family: monospace;
  font-size: 12px;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>