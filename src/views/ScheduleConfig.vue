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
const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
let optionsLst = ref([])
let subjectsOptionsLst = ref([])
const school = computed(() => route.params.school);
const grade = computed(() => route.params.grade);
const cls = computed(() => route.params.cls);
let needs = {}

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

const dataLoaded = ref(false);

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
    for (const datumElement of response.data['options']) {
      optionsLst.value.push({ label: datumElement['label'], value: datumElement['value'] })
      needs[datumElement['label']] = datumElement['need']
    }
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

// 计算最大节数
const maxPeriods = computed(() => {
  let max = 0
  for (const day of dynamicForm.daily_class) {
    const n = needs[day.timetable] || 0
    if (n > max) max = n
  }
  return max
})

function getColumns() {
  const cols = [
    {
      title: '星期',
      key: 'day',
      width: 80,
      fixed: 'left',
      render(row) {
        return h('strong', row.Chinese)
      }
    },
    {
      title: '作息表',
      key: 'timetable',
      width: 140,
      fixed: 'left',
      render(row, index) {
        return h(NSelect, {
          value: row.timetable,
          options: optionsLst.value,
          size: 'small',
          placeholder: '选择作息表',
          onUpdateValue(val) {
            row.timetable = val
            // 重新计算 classList 长度
            const need = needs[val] || 0
            const old = row.classList || []
            row.classList = Array.from({length: need}, (_, i) => old[i] || '')
          }
        })
      }
    }
  ]

  // 动态生成节次列
  for (let i = 0; i < maxPeriods.value; i++) {
    const periodIdx = i
    cols.push({
      title: `第${i + 1}节`,
      key: `period_${i}`,
      width: 120,
      render(row, index) {
        const need = needs[row.timetable] || 0
        if (periodIdx >= need) return h('span', {style: 'opacity: 0.3;'}, '-')
        const val = (row.classList || [])[periodIdx] || null
        return h(NSelect, {
          value: val,
          options: subjectsOptionsLst.value,
          size: 'small',
          placeholder: '选科目',
          onUpdateValue(val) {
            row.classList[periodIdx] = val
          }
        })
      }
    })
  }

  return cols
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
      <NDataTable
        v-if="dataLoaded"
        :columns="getColumns()"
        :data="dynamicForm.daily_class"
        :bordered="true"
        :single-line="false"
        size="small"
        :scroll-x="800"
      />
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
.submit-area {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--n-border-color, #e0e0e6);
}
</style>
