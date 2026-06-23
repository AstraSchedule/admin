<script setup>
import {h, ref, watch} from 'vue'
import {NButton, NCard, NDataTable, NInput, NSpace, NTag, useMessage} from 'naive-ui'
import {useRequest} from 'vue-request'
import {useRouter} from 'vue-router'
import ScopeTags from '@/components/ScopeTags.vue'
import ConfirmPasswordModal from '@/components/ConfirmPasswordModal.vue'
import {deleteCountdown, listCountdown} from '@/api/countdown.js'

const router = useRouter()
const message = useMessage()

const rows = ref([])
const keyword = ref('')

const {run, loading} = useRequest(listCountdown, {
  manual: false,
  onSuccess: (res) => {
    rows.value = Array.isArray(res?.data) ? res.data : []
    applyFilter()
  },
  onError: (e) => {
    console.error('[countdown] 获取失败', e)
    rows.value = []
    applyFilter()
  }
})

const showDelete = ref(false)
const deleting = ref(false)
const deleteId = ref('')

function askDelete(row) {
  deleteId.value = row.id
  showDelete.value = true
}

async function doDelete(password) {
  if (!deleteId.value) return
  deleting.value = true
  try {
    await deleteCountdown(deleteId.value, password)
    message.success('已删除')
    showDelete.value = false
    deleteId.value = ''
    run()
  } catch (e) {
    const status = e?.status || e?.response?.status
    if (status === 401) message.error('你寻思寻思这密码它对吗？')
    else message.error(`删除失败（状态码：${status ?? '未知'}）`)
  } finally {
    deleting.value = false
  }
}

function goAdd() {
  router.push('/countdown/add')
}

function onEdit(row) {
  router.push(`/countdown/edit/${row.id}`)
}

const statusTypeMap = {'已过期': 'error', '生效中': 'success', '就是今天': 'warning', '未知': 'default'}

function renderStatus(status) {
  const type = statusTypeMap[status] || 'default'
  return h(NTag, {size: 'small', bordered: false, type}, {default: () => status})
}

const columns = [
  {
    type: 'expand',
    expandable: (row) => row.schedules && row.schedules.length > 0,
    renderExpand: (row) => {
      return h('div', {style: 'padding: 8px 16px;'}, [
        ...(row.schedules || []).map((sch, idx) =>
          h('div', {key: idx, style: 'padding: 6px 0; display: flex; align-items: center; gap: 12px;'}, [
            h(NTag, {size: 'small', bordered: false}, {default: () => sch.name}),
            h('span', {style: 'font-size: 13px; opacity: 0.7;'}, sch.date),
            h(NTag, {size: 'small', bordered: false, type: 'info'}, {default: () => `P${sch.priority ?? 0}`}),
            renderStatus(sch.status)
          ])
        )
      ])
    }
  },
  {title: '唯一ID', key: 'id', ellipsis: {tooltip: true}},
  {title: '生效域', key: 'scope', render: (row) => h(ScopeTags, {scopes: row.scope})},
  {
    title: '状态', key: 'status', width: 100, align: 'center',
    render: (row) => {
      const s = row.status || '未知'
      const type = statusTypeMap[s] || 'default'
      return h(NTag, {size: 'small', bordered: false, type: type}, {default: () => s})
    }
  },
  {
    title: '日程数量',
    key: 'count',
    width: 100,
    align: 'center',
    render: (row) => String(Array.isArray(row.schedules) ? row.schedules.length : 0)
  },
  {
    title: '快捷操作',
    key: 'actions',
    width: 180,
    align: 'center',
    render: (row) => h(NSpace, {justify: 'center'}, {
      default: () => [
        h(NButton, {size: 'small', tertiary: true, onClick: () => onEdit(row)}, {default: () => '修改'}),
        h(NButton, {
          size: 'small',
          tertiary: true,
          type: 'error',
          onClick: () => askDelete(row)
        }, {default: () => '删除'})
      ]
    })
  }
]

const expandedRowKeys = ref([])

const filteredRows = ref([])

function applyFilter() {
  const k = String(keyword.value || '').trim()
  if (!k) {
    filteredRows.value = rows.value
    return
  }
  filteredRows.value = rows.value.filter((r) => {
    if (String(r.id || '').includes(k)) return true
    const list = Array.isArray(r.schedules) ? r.schedules : []
    return list.some(it => String(it.name || '').includes(k) || String(it.date || '').includes(k))
  })
}

function refresh() {
  run()
}

watch(keyword, () => {
  applyFilter()
})
</script>

<template>
  <n-card :bordered="false" title="倒数日配置">
    <template #header-extra>
      <n-space>
        <n-input v-model:value="keyword" clearable placeholder="按 ID/名称/日期筛选" style="width: 220px"
                 @update:value="applyFilter"/>
        <n-button size="small" @click="goAdd">新增</n-button>
        <n-button :loading="loading" size="small" @click="refresh">刷新</n-button>
      </n-space>
    </template>

    <n-data-table
      :columns="columns"
      :data="filteredRows"
      :loading="loading"
      :pagination="false"
      v-model:expanded-row-keys="expandedRowKeys"
      :row-key="(row) => row.id"
    >
      <template #expanded-row="{ row }">
        <div style="padding: 8px 16px;">
          <div v-if="!row.schedules || row.schedules.length === 0" style="opacity: 0.5;">暂无日程</div>
          <div v-for="(sch, idx) in (row.schedules || [])" :key="idx" style="padding: 6px 0; display: flex; align-items: center; gap: 12px;">
            <n-tag size="small" :bordered="false">{{ sch.name }}</n-tag>
            <span style="font-size: 13px; opacity: 0.7;">{{ sch.date }}</span>
            <n-tag size="small" :bordered="false" type="info">P{{ sch.priority ?? 0 }}</n-tag>
            <n-tag size="small" :bordered="false" :type="statusTypeMap[sch.status] || 'default'">{{ sch.status }}</n-tag>
          </div>
        </div>
      </template>
    </n-data-table>

    <confirm-password-modal
        :loading="deleting"
        :show="showDelete"
        confirm-text="确认删除"
        title="删除倒数日配置"
        @confirm="doDelete"
        @update:show="val => showDelete = val"
    />
  </n-card>
</template>

<style scoped>
:deep(.n-data-table th) {
    font-weight: 600;
}
</style>
