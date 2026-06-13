<script setup>
import {useRequest} from 'vue-request';
import {
  NButton,
  NCard,
  NDataTable,
  NFlex,
  NResult,
  NSpin,
  NStatistic,
  NTag,
  useThemeVars
} from 'naive-ui';
import axios from 'axios';
import {computed, h, reactive, ref} from "vue";
import gsap from 'gsap';
import {APISRV} from '../global.js'

const isServerless = ref(false);
const isInitialLoading = ref(true);
const hitokoto = ref('');
const showHitokoto = ref(false);

const columns = [
  {
      title: '班级',
      key: 'name',
      defaultSortOrder: false,
      sorter: 'default'
  },
  {
      title: '连接状态',
      key: 'status',
      defaultSortOrder: false,
      sorter: 'default',
      render(row) {
          return h(
                NTag,
                {
                    style: {
                        marginRight: '6px'
                    },
                    type: row.status === '已断开连接' ? "error" : 'success',
                    bordered: false
                },
                {
                    default: () => row.status
                }
            )

      }
  },
  {
      title: '今日异常断连次数',
      key: 'disconnect',
      defaultSortOrder: false,
      sorter: (row1, row2) => row1.disconnect - row2.disconnect
  }
]
const getStatistic = () => axios.get(`${APISRV}/web/statistic`);
const getHitokoto = () => axios.get('https://v1.hitokoto.cn/');
const statInfo = reactive(
    {
        "weather_error":0,
        "websocket_disconnect":{},
        "clients":[],
        "websocket_disconnect_count": 0,
        "clients_count": 0
    }
);

let statTable = ref([]);
// noinspection JSCheckFunctionSignatures
const { cancel } = useRequest(
    getStatistic,
    {
      pollingInterval: 1000,
      initialData: {
          "weather_error": 0,
          "websocket_disconnect": {},
          "clients": [],
          "websocket_disconnect_count": 0,
          "clients_count": 0
      },
      onSuccess: (response) => {
        isInitialLoading.value = false;
        if (response.data.serverless) {
          isServerless.value = true;
          cancel();
          getHitokoto().then(response => {
            hitokoto.value = response.data.hitokoto;
          }).catch(() => {
            hitokoto.value = '人生如逆旅，我亦是行人。';
          });
          return;
        }
        let statMap = {};
        statTable.value = []
        console.log(response.data);
        gsap.to(statInfo, {
          "weather_error": response.data["weather_error"],
          "websocket_disconnect": response.data["websocket_disconnect_count"],
          "clients": response.data["clients_count"]
        });
        // noinspection JSCheckFunctionSignatures
        for (let [key, value] of Object.entries(response.data["websocket_disconnect"])) {
            statMap[key] = ["已断开连接", value];
        }
        for (let [, name] of Object.entries(response.data["clients"])) {
            if (statMap[name])
                statMap[name][0] = "保持连接";
            else
                statMap[name] = ["保持连接", 0];
        }
        for (let [keys, value] of Object.entries(statMap)) {
            statTable.value.push(
                {
                    key: keys,
                    name: keys,
                    status: value[0],
                    disconnect: value[1]
                }
            )
        }
        console.log(statTable);
      }
    }
);
const weatherError = computed(() => {
    return Number.parseInt(statInfo.weather_error).toLocaleString();
});
const wsDisconnect = computed(() => {
    return Number.parseInt(statInfo.websocket_disconnect).toLocaleString();
});
const clientsCount = computed(() => {
    // noinspection JSCheckFunctionSignatures
    return Number.parseInt(statInfo.clients).toLocaleString();
});
useThemeVars();


</script>

<template>
    <NFlex v-if="isInitialLoading" justify="center" align="center" style="min-height: 300px;">
        <NSpin size="large" description="加载中..." />
    </NFlex>
    <NFlex v-else-if="isServerless" vertical justify="center" align="center" style="min-height: 300px;">
        <NResult
            v-if="!showHitokoto"
            status="418"
            title="星程课表"
            description="支持集控 · 自动调休 · 兼容 Windows 7"
        >
            <template #icon>
                <img src="https://image-hk-1.oss-accelerate.aliyuncs.com/icon.png" alt="星程课表" style="width: 100px; height: 100px;" />
            </template>
            <template #footer>
                <NButton @click="showHitokoto = true">换一句</NButton>
            </template>
        </NResult>
        <NResult
            v-else
            status="418"
            title="一言"
            :description="hitokoto || '正在获取一言...'"
        >
            <template #footer>
                <NButton @click="showHitokoto = false">返回</NButton>
            </template>
        </NResult>
    </NFlex>
    <NFlex v-else vertical>
        <NCard title="今日统计">
            <NFlex justify="center">
                <NCard class="stat">
                  <NStatistic label="天气上游 API 响应错误" :value="weatherError"/>
                </NCard>
                <NCard class="stat">
                  <NStatistic label="WebSocket 异常断连" :value="wsDisconnect"/>
                </NCard>
                <NCard class="stat">
                 <NStatistic label="正在连接的客户端数量" :value="clientsCount"/>
                </NCard>
            </NFlex>
        </NCard>
        <NCard title="各班详情">
            <n-data-table
              ref="dataTableInst"
              :columns="columns"
              :data="statTable"
            />
        </NCard>
    </NFlex>
</template>
