<template>
  <div class="home">
    <div class="projects">
      <el-select class="projects-select" v-model="projectiId" @change="projectChange" placeholder="请选择">
        <el-option
          v-for="item in projects"
          :key="item.id"
          :label="item.name"
          :value="item.token">
        </el-option>
      </el-select>
      <el-button type="primary" @click="openProjectBox">新增项目</el-button>
    </div>
    <el-dialog
      title="提示"
      :visible.sync="projectBoxShow"
      width="30%"
      center>
      <el-form :model="projectInfoForm" ref="projectInfoForm" label-width="100px" class="demo-ruleForm">
        <el-form-item
          label="项目名称"
          prop="name"
          :rules="[
            { required: true, message: '项目名称不能为空'},
            { min: 1, max: 15, message: '长度在 1 到 15 个字符', trigger: 'blur' }
          ]"
        >
          <el-input v-model="projectInfoForm.name"></el-input>
        </el-form-item>
        <!-- <el-form-item>
          <el-upload
            class="upload-demo"
            ref="upload"
            action="/upload"
            name='avatar'
            :file-list="fileList"
            :auto-upload="false"
            :multiple="true">
            <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
            <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item> -->
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeProjectBox">取 消</el-button>
        <el-button type="primary" @click="submit">确 定</el-button>
      </span>
    </el-dialog>


    <el-button type="primary" @click="codeErr">js错误</el-button>
    <el-button type="success" @click="asyncError">异步错误</el-button>
    <el-button type="danger" @click="promiseErr">promise错误</el-button>
    <el-button type="info" @click="xhrError">xhr请求报错</el-button>
    <el-button type="warning" @click="fetchError">fetch请求报错</el-button>
    <el-button type="danger" @click="resourceError">加载资源报错</el-button>
    <p class="error">报错统计</p>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column prop="message" label="报错信息" width="300"> </el-table-column>
      <el-table-column prop="pageUrl" label="报错页面"> </el-table-column>
      <el-table-column prop="time" label="报错时间" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.time ? format(scope.row.time) : scope.row.date }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="apikey" label="项目编号"> </el-table-column>
      <el-table-column prop="userId" label="用户id"> </el-table-column>
      <el-table-column prop="sdkVersion" label="SDK版本"> </el-table-column>
      <el-table-column prop="deviceInfo" label="浏览器信息">
        <template slot-scope="scope">
          <span>{{ scope.row.deviceInfo.browser }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="deviceInfo" label="操作系统">
        <template slot-scope="scope">
          <span>{{ scope.row.deviceInfo.os }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" prop="recordScreenId" label="还原错误代码" width="100">
        <template slot-scope="scope">
          <el-button v-if="scope.row.type == 'error' || scope.row.type == 'unhandledrejection'" type="primary" @click="revertCode(scope.row)">查看源码</el-button>
        </template>
      </el-table-column>
      <el-table-column fixed="right" prop="recordScreenId" label="播放录屏" width="100">
        <template slot-scope="scope">
          <el-button v-if="scope.row.recordScreenId" type="primary" @click="playRecord(scope.row)">播放录屏</el-button>
        </template>
      </el-table-column>
      <el-table-column fixed="right" prop="breadcrumb" label="用户行为记录" width="125">
        <template slot-scope="scope">
          <el-button v-if="scope.row.breadcrumb" type="primary" @click="revertBehavior(scope.row)">查看用户行为</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="dialogTitle" :class="{ 'revert-disalog': fullscreen }" top="10vh" :fullscreen="fullscreen" :visible.sync="revertdialog" width="90%" :destroy-on-close="true">
      <div id="revert" ref="revert" v-if="dialogTitle != '查看用户行为'"></div>
      <el-timeline v-else>
        <el-timeline-item v-for="(activity, index) in activities" :key="index" :icon="activity.icon" :color="activity.color" :timestamp="format(activity.time)">
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
    <div id="echart" style="width: 400px; height: 300px"></div>
  </div>
</template>

<script>
import { findCodeBySourceMap } from '../utils/sourcemap';
import { unzip } from '../utils/recordScreen.js';
import rrwebPlayer from 'rrweb-player';
import { getProjectList, addProject } from '../api/project/index.js'
import 'rrweb-player/dist/style.css';

export default {
  name: 'HomeView',
  data() {
    return {
      fullscreen: true,
      revertdialog: false,
      dialogTitle: '',
      activities: [],
      tableData: [],

      projects: [],
      projectiId: '',
      mapVersion: '',
      projectBoxShow: false,
      projectInfoForm: {
        name: ''
      },
      fileList: []
    };
  },
  async created() {
    // await this.getProjectList();
    // if(this.projects.length) {
    //   let info = this.projects[0];
    //   this.projectiId = info.token;
    //   // this.$store.commit('setMapVersion', this.setMapVersion(info.mapVersion));
    // }
    // this.getTableData();
  },
  mounted() {
    // this.myEcharts();
  },
  methods: {
    // 获取全部项目列表
    async getProjectList(){
      let params = {};
      let [err, res] = await getProjectList(params);
      if (!err) {
        this.projects = res.data || [];
        if(this.projects.length) {
          let info = this.projects[0];
          this.projectiId = info.token;
          // this.$store.commit('setMapVersion', this.setMapVersion(info.mapVersion));
        }
      }
    },
    // 切换项目
    projectChange(token) {
      let info = this.projects.find(item=>{return item.token == token});
      // this.$store.commit('setMapVersion', this.setMapVersion(info.mapVersion));
      this.getTableData();
    },
    // 修改setMapVersion
    setMapVersion(version=1) {
      return Number(version);
    },
    // 打开新增/编辑弹窗
    openProjectBox() {
      this.projectBoxShow = true;
    },
    // 关闭新增/编辑弹窗
    closeProjectBox() {
      this.projectBoxShow = false;
      this.projectInfoForm = {
        name: ''
      }
    },
    // 提交项目信息
    async submit() {
      let params = {
        name: this.projectInfoForm.name,
      };
      let [err, res] = await addProject(params);
      if (!err) {
        this.getProjectList();
        this.closeProjectBox();
      }
    },
    // 上传源码
    submitUpload() {
        this.$refs.upload.submit();
      },

    myEcharts() {
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById('echart'));

      // 指定图表的配置项和数据
      let option = {
        animation: false,
        title: {
          text: 'ECharts 入门示例'
        },
        tooltip: {},
        legend: {
          data: ['销量']
        },
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      };

      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },
    getTableData() {
        fetch(`http://${process.env.VUE_APP_NODE_HOST}:${process.env.VUE_APP_NODE_PORT}/api/getErrorList?apikey=${this.projectiId}`)
          .then((response) => response.json())
          .then((res) => {
            this.tableData = res?.data?.data || [];
          });
    },
    fetchError() {
      fetch('https://jsonplaceholder.typicode.com/posts/a')
        .then((res) => {
          if (res.status == 404) {
            this.getTableData();
          }
        })
        .catch(() => {
          this.getTableData();
        });
    },
    revertBehavior({ breadcrumb }) {
      this.dialogTitle = '查看用户行为';
      this.fullscreen = false;
      this.revertdialog = true;
      breadcrumb.forEach((item) => {
        item.color = item.status == 'ok' ? '#5FF713' : '#F70B0B';
        item.icon = item.status == 'ok' ? 'el-icon-check' : 'el-icon-close';
        if (item.category == 'Click') {
          item.content = `用户点击dom: ${item.data}`;
        } else if (item.category == 'Http') {
          item.content = `调用接口: ${item.data.url}, ${item.status == 'ok' ? '请求成功' : '请求失败'}`;
        } else if (item.category == 'Code_Error') {
          item.content = `代码报错：${item.data.message}`;
        } else if (item.category == 'Resource_Error') {
          item.content = `加载资源报错：${item.message}`;
        } else if (item.category == 'Route') {
          item.content = `路由变化：从 ${item.data.from}页面 切换到 ${item.data.to}页面`;
        }
      });
      this.activities = breadcrumb;
    },
    revertCode(row) {
      findCodeBySourceMap(row, (res) => {
        this.dialogTitle = '查看源码';
        this.fullscreen = false;
        this.revertdialog = true;
        this.$nextTick(() => {
          this.$refs.revert.innerHTML = res;
        });
      });
    },
    playRecord(row) {
      fetch(`http://${process.env.VUE_APP_NODE_HOST}s:${process.env.VUE_APP_NODE_PORT}/api/getRecordScreenId?id=${row.recordScreenId}`)
        .then((response) => response.json())
        .then((res) => {
          let { code, data } = res;
          let eventStr = data?.data?.events;
          if (code == 200 && eventStr) {
            let events = unzip(eventStr);
            this.fullscreen = true;
            this.dialogTitle = '播放录屏';
            this.revertdialog = true;
            this.$nextTick(() => {
              new rrwebPlayer({
                target: document.getElementById('revert'),
                props: {
                  events,
                  UNSAFE_replayCanvas: true
                }
              });
            });
          } else {
            this.$message({
              message: '暂无数据，请稍后重试~',
              type: 'warning',
              duration: 5000
            });
          }
        });
    },
    format(time) {
      let str = new Date(time);
      return str.toLocaleDateString().replace(/\//g, '-') + ' ' + str.toTimeString().substr(0, 8);
    },
    asyncError() {
      this.getTableData();
      setTimeout(() => {
        JSON.parse('');
      });
    },
    codeErr() {
      this.getTableData();
      let a = undefined;
      if (a.length) {
        console.log('1');
      }
    },
    resourceError() {
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://abc.com/index.js';
      document.body.appendChild(script);
      // 资源加载失败
      script.onerror = () => {
        this.getTableData();
      };
    },
    promiseErr() {
      new Promise((resolve) => {
        this.getTableData();
        let person = {};
        person.name.age();
        resolve();
      });
    },

    xhrError() {
      let _this = this;
      let ajax = new XMLHttpRequest();
      ajax.open('GET', 'https://abc.com/test/api');
      ajax.setRequestHeader('content-type', 'application/json');
      ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
          _this.getTableData();
        }
        if (ajax.status === 200 || ajax.status === 304) {
          console.log('ajax', ajax);
        }
      };
      ajax.send();
      ajax.addEventListener('loadend', () => {});
    }
  }
};
</script>
<style lang="less">
.error {
  margin-top: 20px;
  height: 30px;
  line-height: 30px;
  font-weight: 800;
  background-color: #ebeef5;
}
.el-row {
  text-align: left;
  margin-bottom: 10px;
}
.el-dialog__header {
  font-size: 20px;
  font-weight: 800;
}
.el-timeline {
  text-align: left;
  .el-timeline-item__icon {
    font-size: 12px;
  }
}
.revert-disalog {
  .el-dialog__body {
    height: 720px;
  }
}
.rr-player {
  margin: 0 auto;
}
#revert {
  width: 100%;
  display: flex;
}
.errdetail {
  text-align: left;
  width: 100%;
  font-size: 16px;
}
.code-line {
  padding: 5px 0;
}
.heightlight {
  background-color: yellowgreen;
}
.errheader {
  padding: 10px;
  border-bottom: 1px solid rgb(214, 210, 210);
}

.projects {
  display: flex;
  margin-bottom: 20px;
  margin-top: 20px;
  .projects-select {
    margin-right: 10px;
  }
}
</style>
