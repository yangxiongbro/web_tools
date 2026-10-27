<script setup>
import { computed, ref } from 'vue'
import { ChevronDown, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  data: {
    type: [Array, Object, String, Number, Boolean],
    default: null,
  },
  nodeKey: {
    type: [String, Number],
    default: null,
  },
  depth: {
    type: Number,
    default: 0,
  },
  isArrayItem: {
    type: Boolean,
    default: false,
  },
})

const expanded = ref(props.depth < 2)

const isObject = computed(
  () => props.data !== null && typeof props.data === 'object',
)
const isArray = computed(() => Array.isArray(props.data))
const entries = computed(() => (isObject.value ? Object.entries(props.data) : []))
const expandable = computed(() => isObject.value && entries.value.length > 0)
const hasKey = computed(() => props.nodeKey !== null && props.nodeKey !== undefined)
const openingBracket = computed(() => (isArray.value ? '[' : '{'))
const closingBracket = computed(() => (isArray.value ? ']' : '}'))
const displayKey = computed(() => {
  if (!hasKey.value) {
    return ''
  }
  return props.isArrayItem ? String(props.nodeKey) : JSON.stringify(String(props.nodeKey))
})
const valueType = computed(() => {
  if (props.data === null) {
    return 'null'
  }
  return typeof props.data
})
const primitiveValue = computed(() => {
  if (typeof props.data === 'string') {
    return JSON.stringify(props.data)
  }
  if (props.data === null) {
    return 'null'
  }
  return String(props.data)
})
const itemLabel = computed(() => (isArray.value ? '项' : '个字段'))

function toggleExpanded() {
  if (expandable.value) {
    expanded.value = !expanded.value
  }
}

function handleRowKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    toggleExpanded()
  }
}
</script>

<template>
  <div class="json-tree-node">
    <div
      class="tree-row"
      :class="{ 'is-toggleable': expandable, 'is-expanded': expanded }"
      :role="expandable ? 'button' : undefined"
      :tabindex="expandable ? 0 : undefined"
      :aria-expanded="expandable ? expanded : undefined"
      @click="toggleExpanded"
      @keydown="handleRowKeydown"
    >
      <span class="tree-caret" aria-hidden="true">
        <ChevronDown v-if="expandable && expanded" :size="13" />
        <ChevronRight v-else-if="expandable" :size="13" />
      </span>

      <template v-if="hasKey">
        <span class="key-token" :class="{ 'array-index': isArrayItem }">
          {{ displayKey }}
        </span>
        <span class="punctuation-token">:</span>
      </template>

      <template v-if="isObject">
        <span class="punctuation-token">{{ openingBracket }}</span>
        <template v-if="entries.length === 0">
          <span class="punctuation-token">{{ closingBracket }}</span>
          <span class="empty-token">空</span>
        </template>
        <template v-else-if="expanded">
          <span class="count-token">{{ entries.length }} {{ itemLabel }}</span>
        </template>
        <template v-else>
          <span class="ellipsis-token">…</span>
          <span class="punctuation-token">{{ closingBracket }}</span>
          <span class="count-token">{{ entries.length }} {{ itemLabel }}</span>
        </template>
      </template>

      <span v-else class="value-token" :class="`is-${valueType}`">
        {{ primitiveValue }}
      </span>
    </div>

    <div v-if="expandable && expanded" class="tree-children">
      <JsonTree
        v-for="[key, value] in entries"
        :key="key"
        :data="value"
        :node-key="key"
        :is-array-item="isArray"
        :depth="depth + 1"
      />
      <div class="tree-row closing-row">
        <span class="tree-caret" aria-hidden="true"></span>
        <span class="punctuation-token">{{ closingBracket }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.json-tree-node {
  min-width: max-content;
}

.tree-row {
  min-height: 25px;
  padding: 2px 8px 2px 2px;
  display: flex;
  align-items: baseline;
  gap: 5px;
  border-radius: 4px;
  font-family: var(--font-code);
  font-size: 12px;
  line-height: 1.65;
  white-space: nowrap;
}

.tree-row.is-toggleable {
  cursor: pointer;
}

.tree-row.is-toggleable:hover {
  background: #eef4f3;
}

.tree-row:focus-visible {
  outline: 2px solid rgba(22, 122, 108, 0.42);
  outline-offset: -2px;
}

.tree-caret {
  width: 14px;
  height: 14px;
  display: inline-flex;
  flex: 0 0 14px;
  align-self: center;
  align-items: center;
  justify-content: center;
  color: #849397;
}

.key-token {
  color: #276b80;
  font-weight: 600;
}

.key-token.array-index {
  color: #a1602a;
  font-weight: 500;
}

.punctuation-token {
  color: #6d777b;
}

.value-token {
  white-space: pre-wrap;
  word-break: break-word;
}

.value-token.is-string {
  color: #1b805e;
}

.value-token.is-number {
  color: #2c65aa;
}

.value-token.is-boolean {
  color: #bd5b39;
  font-weight: 600;
}

.value-token.is-null {
  color: #8a7a9b;
  font-style: italic;
}

.count-token,
.empty-token {
  color: #99a4a7;
  font-family: var(--font-ui);
  font-size: 9px;
}

.ellipsis-token {
  color: #768489;
}

.tree-children {
  margin-left: 8px;
  padding-left: 10px;
  border-left: 1px solid #e3e9ea;
}

.closing-row {
  min-height: 20px;
}

@media (max-width: 520px) {
  .tree-row {
    font-size: 11px;
  }

  .tree-children {
    margin-left: 4px;
    padding-left: 7px;
  }
}
</style>
