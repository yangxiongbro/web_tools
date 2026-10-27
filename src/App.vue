<script setup>
import { computed, ref } from 'vue'
import {
  Braces,
  CaseSensitive,
  ChevronRight,
  ShieldCheck,
} from 'lucide-vue-next'
import JsonFormatter from './components/JsonFormatter.vue'
import NameConverter from './components/NameConverter.vue'

const tools = [
  {
    id: 'json',
    title: 'JSON 格式化',
    description: '校验、格式化与折叠浏览',
    icon: Braces,
    component: JsonFormatter,
  },
  {
    id: 'naming',
    title: '命名规范转换',
    description: '驼峰与下划线命名互转',
    icon: CaseSensitive,
    component: NameConverter,
  },
]

const activeToolId = ref('json')
const activeTool = computed(
  () => tools.find((tool) => tool.id === activeToolId.value) ?? tools[0],
)
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <span>{</span>
          <span>}</span>
        </div>
        <div class="brand-copy">
          <strong>DevKit</strong>
          <span>WEB TOOLKIT</span>
        </div>
      </div>

      <nav class="tool-switcher" aria-label="工具选择">
        <button
          v-for="tool in tools"
          :key="tool.id"
          class="tool-switch-button"
          :class="{ 'is-active': activeToolId === tool.id }"
          type="button"
          :aria-current="activeToolId === tool.id ? 'page' : undefined"
          @click="activeToolId = tool.id"
        >
          <span class="tool-switch-icon">
            <component :is="tool.icon" :size="19" :stroke-width="1.8" />
          </span>
          <span class="tool-switch-copy">
            <strong>{{ tool.title }}</strong>
            <span>{{ tool.description }}</span>
          </span>
          <ChevronRight class="tool-switch-arrow" :size="16" />
        </button>
      </nav>

      <div class="sidebar-note">
        <ShieldCheck :size="18" />
        <span>
          <strong>本地处理</strong>
          内容不会上传
        </span>
      </div>
    </aside>

    <main class="main-shell">
      <header class="app-header">
        <div class="breadcrumb">
          <span>DEVKIT</span>
          <ChevronRight :size="13" />
          <strong>{{ activeTool.title }}</strong>
        </div>
        <div class="runtime-status">
          <span class="runtime-dot" aria-hidden="true"></span>
          浏览器本地运行
        </div>
      </header>

      <div class="main-content">
        <Transition name="page" mode="out-in">
          <component :is="activeTool.component" :key="activeTool.id" />
        </Transition>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 264px minmax(0, 1fr);
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 28px 20px 22px;
  display: flex;
  flex-direction: column;
  color: #f7faf9;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), transparent 24%),
    #10252b;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px 28px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  display: grid;
  place-content: center;
  grid-template-columns: auto auto;
  gap: 2px;
  color: #10252b;
  background: #f6c66f;
  border-radius: 8px;
  font-family: var(--font-code);
  font-size: 16px;
  font-weight: 800;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.16);
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.brand-copy strong {
  font-size: 19px;
  line-height: 1;
  letter-spacing: 0;
}

.brand-copy span {
  color: #8fa6aa;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
}

.tool-switcher {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-switch-button {
  position: relative;
  width: 100%;
  min-height: 72px;
  padding: 13px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #b7c6c8;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease,
    border-color 160ms ease,
    transform 160ms ease;
}

.tool-switch-button:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.055);
}

.tool-switch-button:active {
  transform: translateY(1px);
}

.tool-switch-button.is-active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.1);
}

.tool-switch-button.is-active::before {
  position: absolute;
  top: 15px;
  bottom: 15px;
  left: -1px;
  width: 3px;
  background: #f6c66f;
  border-radius: 0 3px 3px 0;
  content: '';
}

.tool-switch-icon {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: #b9d5d0;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 7px;
}

.is-active .tool-switch-icon {
  color: #10252b;
  background: #f6c66f;
}

.tool-switch-copy {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}

.tool-switch-copy strong {
  font-size: 14px;
  font-weight: 650;
}

.tool-switch-copy span {
  overflow: hidden;
  color: #84999c;
  font-size: 11px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.is-active .tool-switch-copy span {
  color: #aebdc0;
}

.tool-switch-arrow {
  flex: 0 0 auto;
  opacity: 0;
  transform: translateX(-4px);
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.is-active .tool-switch-arrow {
  opacity: 0.7;
  transform: translateX(0);
}

.sidebar-note {
  margin-top: auto;
  padding: 14px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8da2a5;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 11px;
  line-height: 1.5;
}

.sidebar-note svg {
  flex: 0 0 auto;
  color: #78b8ac;
}

.sidebar-note span {
  display: flex;
  flex-direction: column;
}

.sidebar-note strong {
  color: #cbd6d7;
  font-size: 11px;
  font-weight: 650;
}

.main-shell {
  min-width: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 62px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(250, 251, 251, 0.84);
  border-bottom: 1px solid #dce3e5;
  backdrop-filter: blur(12px);
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #8a969b;
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.07em;
}

.breadcrumb strong {
  color: #39484d;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0;
}

.runtime-status {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #68767b;
  font-size: 11px;
}

.runtime-dot {
  width: 7px;
  height: 7px;
  background: #22a77f;
  border: 2px solid #c8eee3;
  border-radius: 999px;
  box-sizing: content-box;
}

.main-content {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  padding: 34px 34px 44px;
}

.page-enter-active,
.page-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 900px) {
  .app-shell {
    display: flex;
    flex-direction: column;
  }

  .sidebar {
    position: sticky;
    z-index: 20;
    top: 0;
    width: 100%;
    height: auto;
    padding: 10px 14px;
    flex-direction: row;
    align-items: center;
    gap: 14px;
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .brand {
    flex: 0 0 auto;
    padding: 0;
  }

  .brand-mark {
    width: 34px;
    height: 34px;
    font-size: 14px;
  }

  .brand-copy {
    display: none;
  }

  .tool-switcher {
    min-width: 0;
    flex: 1;
    flex-direction: row;
  }

  .tool-switch-button {
    min-width: 0;
    min-height: 44px;
    flex: 1;
    justify-content: center;
    padding: 8px 10px;
  }

  .tool-switch-button.is-active::before {
    top: auto;
    right: 18px;
    bottom: -1px;
    left: 18px;
    width: auto;
    height: 2px;
    border-radius: 2px 2px 0 0;
  }

  .tool-switch-icon {
    width: 30px;
    height: 30px;
  }

  .tool-switch-copy {
    flex: 0 1 auto;
  }

  .tool-switch-copy strong {
    font-size: 12px;
    white-space: nowrap;
  }

  .tool-switch-copy span,
  .tool-switch-arrow,
  .sidebar-note {
    display: none;
  }

  .app-header {
    display: none;
  }

  .main-content {
    padding: 26px 20px 36px;
  }
}

@media (max-width: 520px) {
  .sidebar {
    gap: 8px;
  }

  .tool-switch-button {
    gap: 7px;
    padding: 7px 6px;
  }

  .tool-switch-icon {
    width: 27px;
    height: 27px;
  }

  .tool-switch-copy strong {
    font-size: 11px;
  }

  .main-content {
    padding: 22px 14px 30px;
  }
}
</style>
