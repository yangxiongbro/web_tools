<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { ElMessage, ElRadioButton, ElRadioGroup } from 'element-plus'
import {
  ArrowRight,
  CaseSensitive,
  Check,
  Copy,
  FileCode2,
  Sparkles,
  Trash2,
} from 'lucide-vue-next'
import { copyText } from '../utils/clipboard'
import { convertName, namingModes } from '../utils/naming'

const mode = ref('snakeToCamel')
const source = ref('user_profile_image')
const copied = ref(false)
let copyTimer = null

const modeOptions = Object.entries(namingModes).map(([value, config]) => ({
  value,
  ...config,
}))
const activeMode = computed(() => namingModes[mode.value])
const converted = computed(() => convertName(source.value, mode.value))
const previewResult = computed(() =>
  convertName(activeMode.value.example, mode.value),
)
const sourceStats = computed(() => ({
  characters: source.value.length,
  lines: source.value ? source.value.split(/\r?\n/).length : 0,
}))

function clearAll() {
  source.value = ''
}

async function copyResult() {
  if (!converted.value) {
    return
  }

  try {
    const succeeded = await copyText(converted.value)
    if (!succeeded) {
      throw new Error('无法访问剪贴板')
    }
    copied.value = true
    if (copyTimer) {
      window.clearTimeout(copyTimer)
    }
    copyTimer = window.setTimeout(() => {
      copied.value = false
    }, 1600)
    ElMessage({
      type: 'success',
      message: '已复制转换结果',
      duration: 1500,
    })
  } catch {
    ElMessage.error('复制失败，请检查浏览器剪贴板权限')
  }
}

function useExample() {
  source.value = activeMode.value.example
}

onBeforeUnmount(() => {
  if (copyTimer) {
    window.clearTimeout(copyTimer)
  }
})
</script>

<template>
  <section class="tool-page">
    <div class="tool-heading">
      <div class="heading-copy">
        <div class="heading-kicker"><span>02</span> / NAMING CONVERTER</div>
        <h1>命名规范转换</h1>
        <p>在驼峰命名与下划线命名之间实时转换，支持多行内容逐行处理。</p>
      </div>
      <div class="tool-actions">
        <el-button @click="useExample">
          <Sparkles :size="15" />
          使用示例
        </el-button>
        <el-button :disabled="!source" @click="clearAll">
          <Trash2 :size="15" />
          一键清除
        </el-button>
      </div>
    </div>

    <section class="mode-panel">
      <div class="mode-heading">
        <div class="mode-heading-copy">
          <span class="panel-icon">
            <CaseSensitive :size="17" />
          </span>
          <div>
            <strong>选择转换方向</strong>
            <span>{{ activeMode.description }}</span>
          </div>
        </div>
        <span class="live-label">实时转换</span>
      </div>

      <ElRadioGroup v-model="mode" class="mode-switch" aria-label="转换模式">
        <ElRadioButton
          v-for="option in modeOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.shortLabel }}
        </ElRadioButton>
      </ElRadioGroup>

      <div class="rule-preview">
        <span class="rule-label">规则预览</span>
        <code>{{ activeMode.example }}</code>
        <ArrowRight :size="14" />
        <code class="rule-result">{{ previewResult }}</code>
      </div>
    </section>

    <div class="naming-workspace">
      <section class="work-panel naming-panel">
        <header class="panel-header">
          <div class="panel-title">
            <span class="panel-icon">
              <FileCode2 :size="16" />
            </span>
            <span class="panel-title-copy">
              <strong>原始字符串</strong>
              <span>输入变量名、字段名或方法名</span>
            </span>
          </div>
          <span class="panel-meta">
            {{ sourceStats.lines }} 行 · {{ sourceStats.characters }} 字符
          </span>
        </header>

        <div class="naming-input-shell">
          <el-input
            v-model="source"
            class="naming-input"
            type="textarea"
            resize="none"
            spellcheck="false"
            placeholder="例如：user_profile_image"
            aria-label="输入需要转换的字符串"
          />
        </div>

        <footer class="panel-footer">
          <span>支持下划线、空格与连字符作为分词边界</span>
          <span>自动转换</span>
        </footer>
      </section>

      <section class="work-panel naming-panel result-panel">
        <header class="panel-header">
          <div class="panel-title">
            <span class="panel-icon">
              <CaseSensitive :size="16" />
            </span>
            <span class="panel-title-copy">
              <strong>转换结果</strong>
              <span>{{ activeMode.label }}</span>
            </span>
          </div>
          <div class="result-actions">
            <span v-if="converted" class="status-label">已转换</span>
            <el-tooltip content="复制转换结果" placement="top">
              <el-button
                class="icon-button"
                :disabled="!converted"
                aria-label="复制转换结果"
                @click="copyResult"
              >
                <Check v-if="copied" :size="14" />
                <Copy v-else :size="14" />
              </el-button>
            </el-tooltip>
          </div>
        </header>

        <div class="result-code" :class="{ 'is-empty': !converted }">
          <template v-if="converted">
            <span class="result-line-number" aria-hidden="true">01</span>
            <pre>{{ converted }}</pre>
          </template>
          <div v-else class="empty-state">
            <span class="empty-state-icon">
              <CaseSensitive :size="20" />
            </span>
            <strong>转换结果将在这里显示</strong>
            <p>输入内容后无需操作，结果会自动更新</p>
          </div>
        </div>

        <footer class="panel-footer">
          <span>{{ activeMode.description }}</span>
          <span>可直接复制</span>
        </footer>
      </section>
    </div>
  </section>
</template>

<style scoped>
.mode-panel {
  padding: 16px;
  background: #ffffff;
  border: 1px solid #d9e1e3;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(20, 45, 50, 0.03);
}

.mode-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.mode-heading-copy {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-heading-copy > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mode-heading-copy strong {
  color: #2c3c41;
  font-size: 12px;
  font-weight: 700;
}

.mode-heading-copy span:not(.panel-icon) {
  color: #859196;
  font-size: 10px;
}

.live-label {
  padding: 4px 8px;
  color: #387c70;
  background: #edf6f3;
  border: 1px solid #d5eae5;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 650;
}

.live-label::before {
  width: 5px;
  height: 5px;
  margin-right: 5px;
  display: inline-block;
  background: #24a57e;
  border-radius: 50%;
  vertical-align: 1px;
  content: '';
}

.mode-switch {
  width: 100%;
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.mode-switch :deep(.el-radio-button) {
  min-width: 0;
}

.mode-switch :deep(.el-radio-button__inner) {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5e6d72;
  background: #f7f9f9;
  border-color: #dce4e5;
  font-size: 11px;
  font-weight: 600;
  white-space: normal;
}

.mode-switch :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 6px 0 0 6px;
}

.mode-switch :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 6px 6px 0;
}

.mode-switch :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  color: #ffffff;
  background: #1d7569;
  border-color: #1d7569;
  box-shadow: -1px 0 0 0 #1d7569;
}

.rule-preview {
  margin-top: 12px;
  padding: 9px 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: auto;
  color: #8b969a;
  background: #f8fafa;
  border: 1px solid #e6ebec;
  border-radius: 5px;
  white-space: nowrap;
}

.rule-label {
  padding-right: 9px;
  border-right: 1px solid #dfe5e6;
  color: #849094;
  font-size: 9px;
  font-weight: 650;
}

.rule-preview code {
  color: #40565b;
  font-family: var(--font-code);
  font-size: 10px;
}

.rule-preview code.rule-result {
  color: #157565;
  font-weight: 600;
}

.naming-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.naming-panel {
  height: 390px;
}

.naming-input-shell {
  min-height: 0;
  display: flex;
  flex: 1;
  overflow: hidden;
  background: #fcfdfd;
  box-shadow: inset 0 0 0 2px transparent;
  transition: box-shadow 140ms ease;
}

.naming-input-shell:focus-within {
  box-shadow: inset 0 0 0 2px rgba(22, 122, 108, 0.22);
}

.naming-input {
  height: 100%;
}

.naming-input :deep(.el-textarea) {
  height: 100%;
}

.naming-input :deep(.el-textarea__inner) {
  height: 100% !important;
  min-height: 0 !important;
  padding: 18px;
  color: #24363b;
  background: #fcfdfd;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  font-family: var(--font-code);
  font-size: 14px;
  line-height: 1.75;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.result-code {
  min-height: 0;
  padding: 18px;
  display: flex;
  flex: 1;
  gap: 13px;
  overflow: auto;
  background: #fbfcfc;
}

.result-code.is-empty {
  padding: 0;
}

.result-line-number {
  padding-top: 1px;
  color: #a0abad;
  font-family: var(--font-code);
  font-size: 10px;
  user-select: none;
}

.result-code pre {
  min-width: 0;
  margin: 0;
  color: #186f5e;
  font-family: var(--font-code);
  font-size: 14px;
  font-weight: 550;
  line-height: 1.75;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

@media (max-width: 940px) {
  .naming-workspace {
    grid-template-columns: minmax(0, 1fr);
  }

  .naming-panel {
    height: 330px;
  }
}

@media (max-width: 650px) {
  .mode-panel {
    padding: 14px;
  }

  .mode-heading-copy span:not(.panel-icon) {
    display: none;
  }

  .mode-switch {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }

  .mode-switch :deep(.el-radio-button__inner) {
    border: 1px solid #dce4e5;
    border-radius: 6px;
  }

  .mode-switch :deep(.el-radio-button:first-child .el-radio-button__inner),
  .mode-switch :deep(.el-radio-button:last-child .el-radio-button__inner) {
    border-radius: 6px;
  }

  .mode-switch :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    box-shadow: none;
  }

  .rule-preview {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .rule-label {
    width: 100%;
    padding: 0 0 6px;
    border-right: 0;
    border-bottom: 1px solid #e1e7e8;
  }

  .naming-panel {
    height: 300px;
  }
}
</style>
