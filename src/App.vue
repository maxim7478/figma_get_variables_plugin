<template>
  <div class="app">
    <h2>🎨 Export Figma Variables → CSS</h2>

    <div class="app__collections">
      <UiButton
          v-for="(item, index) in collections"
          :key="index"
          :disabled="loading"
          @click="exportCSS(item.name)"
      >
        {{ item.name }}
      </UiButton>
    </div>

    <div v-if="error" class="error">❌ {{ error }}</div>

    <div v-if="cssOutput" class="result">
      <h3>📋 Generated CSS:</h3>
      <textarea v-model="cssOutput" readonly></textarea>
      <UiButton variant="secondary" @click="copyToClipboard">📋 Copy to Clipboard</UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UiButton from "./components/ui/UiButton.vue";

const loading = ref(false);
const cssOutput = ref('');
const collections = ref<Array<{ id: string, name: string }>>([
  {
    id: 'all',
    name: 'All'
  }
]);
const error = ref('');

const getFigmaCollections = async () => {
  parent.postMessage({ pluginMessage: { type: 'get-collection' } }, '*')
}
getFigmaCollections()

const exportCSS = (typeCollection?: string) => {
  loading.value = true;
  error.value = '';
  cssOutput.value = '';
  parent.postMessage({ pluginMessage: { type: 'export-css', props: { typeCollection } } }, '*');
};

// На подумать
const copyToClipboard = () => {
  // console.log('copyToClipboard');
  // navigator.clipboard.writeText(cssOutput.value);
  // alert('✅ Copied to clipboard!');
};

window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  loading.value = false;

  if (msg.type === 'css-result') {
    cssOutput.value = msg.css;

  } else if (msg.type === 'get-collection-result') {
    collections.value = [...collections.value, ...msg.collectionsMapped];
  } else if (msg.type === 'error') {
    error.value = msg.message;
  }
};
</script>

<style scoped lang="scss">
.app {
  &__collections {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.1rem 1rem;
  }
}


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