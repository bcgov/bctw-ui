<template>
  <div class="container">
    <form enctype="multipart/form-data" novalidate v-if="isInitial || isSaving">
      <div class="dropbox">
        <input type="file" single :name="uploadFieldName" :disabled="isSaving" @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
          accept=".csv" class="input-file">
          <p v-if="isInitial">
            <b>{{title}}</b><br><br>Drag csv file here<br>or click to browse
          </p>
          <p v-if="isSaving">
            Uploading file...
          </p>
      </div>
    </form>
    <div v-if="isSuccess">
      <h2>imported csv successfully.</h2>
      <p><a href="javascript:void(0)" @click="reset()">Upload again</a></p>
      <ul class="list-unstyled">
        <!-- <li v-for="(item, idx) in uploadedFiles" :key="idx">
          <img :src="item.url" class="img-responsive img-thumbnail" :alt="item.originalName">
        </li> -->
      </ul>
    </div>
    <!--FAILED-->
    <div v-if="isFailed">
      <h2>import failed.</h2>
      <p><a href="javascript:void(0)" @click="reset()">Try again</a></p>
      <pre>{{ uploadError }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { ActionPostPayload } from 'frontend/src/types/store';
import { getNotifyProps } from '../notify';

enum LoadStatus {
  INITIAL = 0,
  SAVING = 1,
  SUCCESS = 2,
  FAILED = 3
}

export default {
  name: 'fileInput', 
  props: {
    title: String,
  },
  data() {
    return {
      uploadedFiles: [],
      uploadError: null,
      currentStatus: LoadStatus.INITIAL, 
      uploadFieldName: 'csv'
    }
  },
  computed: {
      isInitial() {
        return this.currentStatus === LoadStatus.INITIAL;
      },
      isSaving() {
        return this.currentStatus === LoadStatus.SAVING;
      },
      isSuccess() {
        return this.currentStatus === LoadStatus.SUCCESS;
      },
      isFailed() {
        return this.currentStatus === LoadStatus.FAILED;
      }
    },
    mounted () {
      this.reset();
    },
    methods: {
      reset() {
        this.currentStatus = LoadStatus.INITIAL;
        this.uploadedFiles = [];
        this.uploadError = null;
      },
      save(formData) {
        this.currentStatus = LoadStatus.SAVING;
        const payload:ActionPostPayload = {body: formData, callback: this.onResultsCallback}
        this.$store.dispatch('uploadCsv', payload)
      },
      filesChange(fieldName: string, fileList) {
        const formData = new FormData();
        if (!fileList.length) return;
        Array
          .from(Array(fileList.length).keys())
          .map(x => {
            formData.append(fieldName, fileList[x], fileList[x].name);
          });
        this.save(formData);
      },
      onResultsCallback(data: any, err?: Error | string) {
        let msg;
        if (err) {
          msg = `error uploading csv ${err}`;
          this.currentStatus = LoadStatus.FAILED;
          this.uploadError = err;
        } else {
          if (Array.isArray(data)) {
            msg = `added ${data.length} items successfully`;
          } else {
            msg = data;
          }
          this.currentStatus = LoadStatus.SUCCESS;
        }
        this.$vs.notify(getNotifyProps(msg, !!err))
      }
  }
}
</script>

<style>
  .dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 100px;
    position: relative;
    cursor: pointer;
    margin-bottom: 10px;
  }

  .input-file {
    opacity: 0;
    width: 100%;
    height: 100px;
    cursor: pointer;
    position: absolute;
    right: 30px; /* fix */
  }

  .dropbox:hover {
    background: lightblue;
  }

  .dropbox p {
    text-align: center;
    padding: 25px 0;
  }
</style>
