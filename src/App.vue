<template>
  <div class="app">
    <h2>🎨 Export Figma Variables → CSS</h2>

    <h3>Collections</h3>
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

    <h3>Generated CSS Variables</h3>
    <div class="app__collections">
      <UiButton
          v-for="(item, index) in generatedVariablesTypes"
          :key="index"
          :disabled="loading"
          @click="getGeneratedCssVariables(item.type)"
      >
        {{ item.name }}
      </UiButton>
    </div>

    <div v-if="error" class="error">❌ {{ error }}</div>
    <div v-if="cssOutput" class="result">
      <h3>📋 Generated CSS:</h3>
      <UiButton variant="secondary" @click="copyToClipboard">📋 Copy to Clipboard</UiButton>
      <textarea v-model="cssOutput" readonly></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UiButton from "./components/ui/UiButton.vue";
import {TGeneratedVariablesType} from "./types";

const loading = ref(false);
const cssOutput = ref('');
const collections = ref<Array<{ id: string, name: string }>>([
  {
    id: 'all',
    name: 'All'
  }
]);
const error = ref('');

const generatedVariablesTypes: Record<string, string | TGeneratedVariablesType>[] = [
  {
    name: 'All',
    type: 'ALL',
  },
  {
    name: 'Common',
    type: 'COMMON',
  },
  {
    name: 'Gen4',
    type: 'GEN4',
  },
  {
    name: 'Blueberry',
    type: 'BLUE',
  },
  {
    name: 'Scheme',
    type: 'SCHEME',
  },
]

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

const getGeneratedCssVariables = (type?: TGeneratedVariablesType) => {
  loading.value = true;
  error.value = '';
  cssOutput.value = '';
  parent.postMessage({ pluginMessage: { type: 'generate-css-variables', props: { type } } }, '*');
}

// На подумать
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(cssOutput.value);
    alert('✅ CSS copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy: ', err);

    // Fallback для старых браузеров
    const textarea = document.createElement('textarea');
    textarea.value = cssOutput.value;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    alert('✅ CSS copied to clipboard!');
  }
};

window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  loading.value = false;

  if (msg.type === 'css-result') {
    cssOutput.value = msg.css;

  } else if (msg.type === 'get-collection-result') {
    collections.value = [...collections.value, ...msg.collectionsMapped];
  } else if (msg.type === 'generated-css-variables') {
    cssOutput.value = msg.css;
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
    gap: 0.5rem;
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