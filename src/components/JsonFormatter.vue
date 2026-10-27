<script setup>
import { computed, nextTick, onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  AlertTriangle,
  Braces,
  Check,
  Copy,
  FileJson2,
  LocateFixed,
  Sparkles,
  Trash2,
  WandSparkles,
} from 'lucide-vue-next'
import JsonTree from './JsonTree.vue'
import { copyText } from '../utils/clipboard'
import { getTextStats, parseJson } from '../utils/json'

const exampleJson = `{
  "service": "devkit",
  "version": "1.0.0",
  "features": ["json", "naming"],
  "settings": {
    "theme": "light",
    "localOnly": true,
    "maxDepth": 3
  }
}`

const source = ref('')
const parsedValue = ref(null)
const formatted = ref('')
const error = ref(null)
const hasResult = ref(false)
const copied = ref(false)
const treeKey = ref(0)
const lastFormattedSource = ref('')
const sourceInput = ref(null)
let copyTimer = null

const inputStats = computed(() => getTextStats(source.value))
const outputStats = computed(() => getTextStats(formatted.value))
const isStale = computed(
  () => hasResult.value && source.value !== lastFormattedSource.value,
)

function clearNoticeTimer() {
  if (copyTimer) {
    window.clearTimeout(copyTimer)
    copyTimer = null
  }
}

function handleInput() {
  if (error.value) {
    error.value = null
  }
}

function formatJson() {
  const result = parseJson(source.value)

  if (!result.ok) {
    error.value = result.error
    parsedValue.value = null
    formatted.value = ''
    hasResult.value = false
    return
  }

  error.value = null
  parsedValue.value = result.value
  formatted.value = result.formatted
  lastFormattedSource.value = source.value
  hasResult.value = true
  treeKey.value += 1
  ElMessage({
    type: 'success',
    message: 'JSON 已验证并格式化',
    duration: 1800,
  })
}

function clearAll() {
  source.value = ''
  parsedValue.value = null
  formatted.value = ''
  error.value = null
  hasResult.value = false
  lastFormattedSource.value = ''
  nextTick(() => sourceInput.value?.focus())
}

async function loadExample() {
  source.value = exampleJson
  error.value = null
  formatJson()
  await nextTick()
  sourceInput.value?.focus()
}

async function copyFormatted() {
  if (!formatted.value) {
    return
  }

  try {
    const succeeded = await copyText(formatted.value)
    if (!succeeded) {
      throw new Error('无法访问剪贴板')
    }
    copied.value = true
    clearNoticeTimer()
    copyTimer = window.setTimeout(() => {
      copied.value = false
    }, 1600)
    ElMessage({
      type: 'success',
      message: '已复制格式化 JSON',
      duration: 1500,
    })
  } catch {
    ElMessage.error('复制失败，请检查浏览器剪贴板权限')
  }
}

function focusError() {
  if (!error.value) {
    return
  }

  nextTick(() => {
    const textarea = sourceInput.value?.textarea
    if (!textarea) {
      return
    }
    const start = error.value.index
    textarea.focus()
    textarea.setSelectionRange(start, Math.min(start + 1, source.value.length))
  })
}

onBeforeUnmount(clearNoticeTimer)
</script>

<template>
  <section class="tool-page">
    <div class="tool-heading">
      <div class="heading-copy">
        <div class="heading-kicker"><span>01</span> / JSON WORKBENCH</div>
        <h1>JSON 格式化</h1>
        <p>粘贴 JSON 字符串，自动校验语法并生成可折叠的层级视图。</p>
      </div>
      <div class="tool-actions">
        <el-button @click="loadExample">
          <WandSparkles :size="15" />
          示例
        </el-button>
        <el-button :disabled="!source && !hasResult && !error" @click="clearAll">
          <Trash2 :size="15" />
          一键清除
        </el-button>
        <el-button type="primary" @click="formatJson">
          <Sparkles :size="15" />
          格式化
        </el-button>
      </div>
    </div>

    <div v-if="error" class="error-banner" role="alert">
      <div class="error-icon">
        <AlertTriangle :size="18" />
      </div>
      <div class="error-content">
        <div class="error-heading">
          <strong>JSON 语法错误</strong>
          <span>第 {{ error.line }} 行 · 第 {{ error.column }} 列</span>
        </div>
        <p>{{ error.reason }}</p>
        <pre class="error-snippet">{{ error.lineText }}
{{ error.caret }}</pre>
      </div>
      <el-button class="error-locate" text @click="focusError">
        <LocateFixed :size="14" />
        定位错误
      </el-button>
    </div>

    <div class="json-workspace">
      <section class="work-panel editor-panel">
        <header class="panel-header">
          <div class="panel-title">
            <span class="panel-icon">
              <FileJson2 :size="16" />
            </span>
            <span class="panel-title-copy">
              <strong>输入 JSON</strong>
              <span>支持对象、数组与基础类型</span>
            </span>
          </div>
          <span class="panel-meta">
            {{ inputStats.lines }} 行 · {{ inputStats.characters }} 字符
          </span>
        </header>

        <div class="input-shell" :class="{ 'has-error': error }">
          <el-input
            ref="sourceInput"
            v-model="source"
            class="json-input"
            type="textarea"
            resize="none"
            spellcheck="false"
            placeholder="在此粘贴 JSON 字符串…"
            aria-label="输入 JSON 字符串"
            @input="handleInput"
            @keydown.ctrl.enter.prevent="formatJson"
            @keydown.meta.enter.prevent="formatJson"
          />
        </div>

        <footer class="panel-footer">
          <span class="shortcut">
            <kbd>Ctrl</kbd>
            <span>+</span>
            <kbd>Enter</kbd>
            <span>快速格式化</span>
          </span>
          <span>JSON.parse 校验</span>
        </footer>
      </section>

      <section class="work-panel editor-panel output-panel">
        <header class="panel-header">
          <div class="panel-title">
            <span class="panel-icon">
              <Braces :size="16" />
            </span>
            <span class="panel-title-copy">
              <strong>格式化结果</strong>
              <span>点击层级行可折叠或展开</span>
            </span>
          </div>
          <div class="output-actions">
            <span
              v-if="hasResult"
              class="status-label"
              :class="{ 'is-pending': isStale }"
            >
              {{ isStale ? '待重新格式化' : '格式有效' }}
            </span>
            <el-tooltip content="复制格式化 JSON" placement="top">
              <el-button
                class="icon-button"
                :disabled="!hasResult"
                aria-label="复制格式化 JSON"
                @click="copyFormatted"
              >
                <Check v-if="copied" :size="14" />
                <Copy v-else :size="14" />
              </el-button>
            </el-tooltip>
          </div>
        </header>

        <div class="tree-view">
          <div v-if="hasResult" class="tree-scroll">
            <JsonTree :key="treeKey" :data="parsedValue" />
          </div>
          <div v-else class="empty-state">
            <span class="empty-state-icon">
              <Braces :size="20" />
            </span>
            <strong>等待格式化</strong>
            <p>输入 JSON 后点击“格式化”<br />即可在这里查看可折叠结构</p>
          </div>
        </div>

        <footer class="panel-footer">
          <span v-if="hasResult">
            {{ outputStats.lines }} 行 · {{ outputStats.characters }} 字符
          </span>
          <span v-else>格式化字符串将保留 2 空格缩进</span>
          <span v-if="hasResult">复制内容为格式化文本</span>
        </footer>
      </section>
    </div>
  </section>
</template>

<style scoped>
.json-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.editor-panel {
  height: clamp(540px, calc(100vh - 260px), 720px);
}

.input-shell {
  min-height: 0;
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #fcfdfd;
  box-shadow: inset 0 0 0 2px transparent;
  transition: box-shadow 140ms ease;
}

.input-shell:focus-within {
  box-shadow: inset 0 0 0 2px rgba(22, 122, 108, 0.22);
}

.input-shell.has-error {
  box-shadow: inset 0 0 0 2px rgba(201, 80, 50, 0.18);
}

.json-input {
  height: 100%;
}

.json-input :deep(.el-textarea) {
  height: 100%;
}

.json-input :deep(.el-textarea__inner) {
  height: 100% !important;
  min-height: 0 !important;
  padding: 18px;
  color: #24363b;
  background: #fcfdfd;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  font-family: var(--font-code);
  font-size: 12.5px;
  line-height: 1.75;
  tab-size: 2;
}

.json-input :deep(.el-textarea__inner::placeholder) {
  color: #a8b2b4;
}

.output-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tree-view {
  min-height: 0;
  display: flex;
  flex: 1;
  background: #fbfcfc;
}

.tree-scroll {
  width: 100%;
  padding: 16px 18px;
  overflow: auto;
  scrollbar-color: #c9d4d5 transparent;
  scrollbar-width: thin;
}

.error-banner {
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #663427;
  background: #fff7f3;
  border: 1px solid #efd2c7;
  border-left: 3px solid #c85b3b;
  border-radius: 7px;
}

.error-icon {
  width: 30px;
  height: 30px;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  color: #b44f34;
  background: #fbe7df;
  border-radius: 6px;
}

.error-content {
  min-width: 0;
  flex: 1;
}

.error-heading {
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-heading strong {
  font-size: 12px;
  font-weight: 700;
}

.error-heading span {
  color: #a56551;
  font-family: var(--font-code);
  font-size: 10px;
}

.error-content p {
  margin: 4px 0 0;
  color: #805044;
  font-size: 11px;
  line-height: 1.5;
}

.error-snippet {
  max-width: 100%;
  margin: 9px 0 0;
  padding: 8px 10px;
  overflow: auto;
  color: #7f3e2a;
  background: rgba(255, 255, 255, 0.68);
  border: 1px solid #f0dad1;
  border-radius: 5px;
  font-family: var(--font-code);
  font-size: 10px;
  line-height: 1.45;
}

.error-locate.el-button {
  flex: 0 0 auto;
  margin: -4px -5px 0 0;
  color: #a94b31;
  font-size: 11px;
}

.error-locate.el-button .el-icon {
  margin-right: 4px;
}

@media (max-width: 1040px) {
  .json-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .editor-panel {
    height: auto;
  }

  .input-shell {
    flex: 0 0 auto;
    min-height: 430px;
  }

  .output-panel .tree-view {
    min-height: 430px;
  }
}

@media (max-width: 760px) {
  .error-banner {
    flex-wrap: wrap;
  }

  .error-content {
    width: calc(100% - 44px);
    flex: 0 0 calc(100% - 44px);
  }

  .error-locate.el-button {
    margin-left: 42px;
  }

  .output-actions {
    gap: 8px;
  }

  .output-actions .status-label {
    display: none;
  }

  .input-shell {
    min-height: 360px;
  }

  .output-panel .tree-view {
    min-height: 360px;
  }

  .tree-scroll {
    padding: 14px 12px;
  }
}
</style>
