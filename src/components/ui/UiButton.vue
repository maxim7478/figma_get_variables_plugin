<template>
  <button
      class="ui-button"
      :class="[`ui-button--${variant}`, { 'is-disabled': disabled }]"
      :disabled="disabled"
      @click="emit('click')"
  >
    <span v-if="$slots.before" class="ui-button__before">
      <slot name="before" />
    </span>

    <span class="ui-button__content">
      <slot />
    </span>

    <span v-if="$slots.after" class="ui-button__after">
      <slot name="after" />
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  disabled?: boolean
}>()

const emit = defineEmits<{
  (event: 'click'): void
}>()
</script>

<style scoped lang="scss">
.ui-button {
  --bg: #3b82f6;
  --color: #fff;
  --border: transparent;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  font-size: 0.95rem;
  font-weight: 500;
  font-family: inherit;

  border-radius: 0.6rem;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--color);

  padding: 0.6rem 1.2rem;
  cursor: pointer;
  user-select: none;

  transition: all 0.2s ease;

  &:hover:not(.is-disabled) {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }

  &:active:not(.is-disabled) {
    filter: brightness(0.9);
    transform: translateY(0);
  }

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--secondary {
    --bg: #6b7280;
  }

  &--outline {
    --bg: transparent;
    --border: #3b82f6;
    --color: #3b82f6;
  }

  &--ghost {
    --bg: transparent;
    --color: #374151;
    --border: transparent;
  }

  &__before,
  &__after {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    line-height: 0;
    transition: transform 0.2s ease;
  }

  &__before {
    margin-right: 0.25rem;
  }

  &__after {
    margin-left: 0.25rem;
  }

  &__content {
    display: inline-flex;
    align-items: center;
  }
}
</style>
