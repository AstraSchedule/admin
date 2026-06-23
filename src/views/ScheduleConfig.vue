<script setup>
import {
  NButton,
  NCard,
  NCode,
  NDataTable,
  NFlex,
  NSelect,
  NSpace,
  NStatistic,
  useMessage
} from "naive-ui";
import ConfirmPasswordModal from '@/components/ConfirmPasswordModal.vue';
import {computed, h, reactive, ref} from "vue";
import axios from "axios";
import {APISRV} from "@/global.js";
import {useRequest} from "vue-request";
import {useRoute} from "vue-router";

const route = useRoute();
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const school = computed(() => route.params.school);
const grade = computed(() => route.params.grade);
const cls = computed(() => route.params.cls);
const optionsLst = ref([])
const subjectsOptionsLst = ref([])
const needs = ref({})

const dynamicForm = reactive({
  daily_class: [
    {Chinese:"日",English:"SUN",classList:[],timetable:"常日"},
    {Chinese:"一",English:"MON",classList:[],timetable:"常日"},
    {Chinese:"二",English:"TUE",classList:[],timetable:"常日"},
    {Chinese:"三",English:"WED",classList:[],timetable:"常日"},
    {Chinese:"四",English:"THR",classList:[],timetable:"常日"},
    {Chinese:"五",English:"FRI",classList:[],timetable:"常日"},
    {Chinese:"六",English:"SAT",classList:[],timetable:"常日"}
  ]
});

const showModal = ref(false);
const saving = ref(false);
const dataLoaded = ref(false);

function submit() {
  showModal.value = true;
}

async function onPwdConfirm(password) {
  saving.value = true
  try {
    await axios.put(
      `${APISRV}/web/config/${school.value}/${grade.value}/${cls.value}/schedule`,
      dynamicForm,
      { auth: { username: 'ElectronClassSchedule', password } }
    )
    const messages = useMessage();
    messages.success("服务端说行")
    showModal.value = false
  } catch (error) {
    const messages = useMessage();
    if (error.status === 401) messages.error("你寻思寻思这密码它对吗？")
    else if (error.status === 400) messages.error("码姿不对，删了重写！（服务端校验不通过）")
    else messages.error(`服务端看完天塌了（状态码：${error}）`)
  } finally {
    saving.value = false
  }
}

const getSchedule = () => axios.get(`${APISRV}/web/config/${school.value}/${grade.value}/${cls.value}/schedule`);
const getOptions = () => axios.get(`${APISRV}/web/config/${school.value}/${grade.value}/timetable/options`);
const getSubjectsOptions = () => axios.get(`${APISRV}/web/config/${school.value}/${grade.value}/subjects/options`);

useRequest(getSchedule, {
  refreshDeps: [school, grade, cls],
  initialData: { daily_class: dynamicForm.daily_class },
  onSuccess: (response) => {
    dynamicForm.daily_class = response.data['daily_class'];
    dataLoaded.value = true
  }
});

useRequest(getOptions, {
  refreshDeps: [school, grade, cls],
  initialData: { options: [] },
  onSuccess: (response) => {
    optionsLst.value = []
    const n = {}
    for (const datumElement of response.data['options']) {
      optionsLst.value.push({ label: datumElement['label'], value: datumElement['value'] })
      n[datumElement['label']] = datumElement['need']
    }
    needs.value = n
  }
});

useRequest(getSubjectsOptions, {
  refreshDeps: [school, grade, cls],
  initialData: { options: [] },
  onSuccess: (response) => {
    subjectsOptionsLst.value = []
    for (const datumElement of response.data['options']) {
      subjectsOptionsLst.value.push({ label: datumElement['label'], value: datumElement['value'] })
    }
  }
});

// 最大节数
const maxPeriods = computed(() => {
  let max = 0
  for (const day of dynamicForm.daily_class) {
    const n = needs.value[day.timetable] || 0
    if (n > max) max = n
  }
  return max
})

// 构建行数据：每行是一个节次
const tableData = computed(() => {
  const rows = []
  for (let p = 0; p < maxPeriods.value; p++) {
    rows.push({ period: p + 1 })
  }
  return rows
})

// 构建列：节次 + 周日~周六
function getColumns() {
  const cols = [
    { title: '节次', key: 'period', width: 70, fixed: 'left', align: 'center' }
  ]

  for (let d = 0; d < 7; d++) {
    const dayIdx = d
    cols.push({
      title: `周${weekDays[d]}`,
      key: `day_${d}`,
      width: 130,
      render(row) {
        const day = dynamicForm.daily_class[dayIdx]
        const need = needs.value[day.timetable] || 0
        const periodIdx = row.period - 1
        if (periodIdx >= need) return h('span', {style: 'opacity: 0.3;'}, '-')
        const val = (day.classList || [])[periodIdx] || null
        return h(NSelect, {
          value: val,
          options: subjectsOptionsLst.value,
          size: 'small',
          placeholder: '选科目',
          onUpdateValue(val) {
            day.classList[periodIdx] = val
          }
        })
      }
    })
  }

  return cols
}

// 作息表行（嵌在表头上方或用额外行展示）
function getTimetableRow() {
  return h('tr', {}, [
    h('td', {style: 'font-weight: 600; text-align: center;'}, '作息表'),
    ...weekDays.map((_, d) => {
      return h('td', {}, [
        h(NSelect, {
          value: dynamicForm.daily_class[d].timetable,
          options: optionsLst.value,
          size: 'small',
          placeholder: '作息表',
          style: 'width: 100%;',
          onUpdateValue(val) {
            const day = dynamicForm.daily_class[d]
            day.timetable = val
            const need = needs.value[val] || 0
            const old = day.classList || []
            day.classList = Array.from({length: need}, (_, i) => old[i] || '')
          }
        })
      ])
    })
  ])
}

const previewCode = computed(() => JSON.stringify(dynamicForm, null, 2));
</script>

<template>
  <NFlex vertical>
    <NCard title="所选信息">
      <NFlex justify="center">
        <NCard class="stat">
          <NStatistic label="所选学校" :value="school.toString()"/>
        </NCard>
        <NCard class="stat">
          <NStatistic label="所选年级" :value="grade.toString()"/>
        </NCard>
        <NCard class="stat">
          <NStatistic label="所选班级" :value="cls.toString()"/>
        </NCard>
      </NFlex>
    </NCard>

    <NCard title="课表配置">
      <div v-if="dataLoaded" class="schedule-table-wrap">
        <table class="schedule-table">
          <thead>
            <tr>
              <th style="width: 70px;"></th>
              <th v-for="(day, d) in weekDays" :key="d">周{{ day }}</th>
            </tr>
            <tr class="timetable-row">
              <td class="row-label">作息表</td>
              <td v-for="(day, d) in weekDays" :key="d">
                <NSelect
                  :value="dynamicForm.daily_class[d].timetable"
                  :options="optionsLst"
                  size="small"
                  placeholder="选择"
                  @update:value="(val) => {
                    const dc = dynamicForm.daily_class[d]
                    dc.timetable = val
                    const need = needs[val] || 0
                    const old = dc.classList || []
                    dc.classList = Array.from({length: need}, (_, i) => old[i] || '')
                  }"
                />
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in maxPeriods" :key="p">
              <td class="row-label">第{{ p }}节</td>
              <td v-for="(day, d) in weekDays" :key="d">
                <template v-if="(needs[dynamicForm.daily_class[d].timetable] || 0) >= p">
                  <NSelect
                    :value="(dynamicForm.daily_class[d].classList || [])[p - 1] || null"
                    :options="subjectsOptionsLst"
                    size="small"
                    placeholder="选科目"
                    @update:value="(val) => { dynamicForm.daily_class[d].classList[p - 1] = val }"
                  />
                </template>
                <span v-else class="empty-cell">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else style="text-align: center; padding: 40px; opacity: 0.5;">加载中...</div>

      <div class="submit-area">
        <n-button type="primary" @click="submit">提交</n-button>
      </div>
    </NCard>

    <NCard title="提交前预览">
      <n-code :code="previewCode" language="json" show-line-numbers/>
    </NCard>

    <ConfirmPasswordModal
      v-model:show="showModal"
      :loading="saving"
      confirm-text="确认提交"
      @confirm="onPwdConfirm"
    />
  </NFlex>
</template>

<style scoped>
.schedule-table-wrap {
  overflow-x: auto;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.schedule-table th,
.schedule-table td {
  border: 1px solid var(--n-border-color, #e0e0e6);
  padding: 8px;
  text-align: center;
  white-space: nowrap;
}

.schedule-table th {
  font-weight: 600;
  background: var(--n-card-color, #fafafa);
  position: sticky;
  top: 0;
  z-index: 1;
}

.timetable-row td {
  background: var(--n-card-color, #fafafa);
}

.row-label {
  font-weight: 500;
  width: 70px;
}

.empty-cell {
  opacity: 0.3;
}

.submit-area {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--n-border-color, #e0e0e6);
}
</style>
