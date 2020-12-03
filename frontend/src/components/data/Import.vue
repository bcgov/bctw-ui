<template lang="html">
  <modal
    :title="title"
    :active="active"
    v-on:update:modal="$emit('update:close')"
  >
    <div class="container">
      <p v-if="message && isInitial">{{message}}</p><br>
      <p v-if="isInitial" class="important">Make sure the first row matches the specified headers exactly.</p>
      <form 
        enctype="multipart/form-data"
        novalidate
        v-if="isInitial || isSaving">
        <div class="dropbox">
          <input type="file" single :name="uploadFieldName" :disabled="isSaving"
            @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
            accept=".csv" class="input-file">
            <p v-if="isInitial"><b>Drag CSV file here or click to browse</b></p>
            <p v-if="isSaving">
              Uploading file...
            </p>
        </div>
      </form>
      <div v-if="isSuccess" class="success">
        <p>Import successful: {{uploadSuccess}}</p><br>
        <p><a href="javascript:void(0)" @click="reset()">Import again</a></p>
      </div>
      <div v-if="isFailed">
        <h4 class="warning">There were errors uploading:</h4>
        <div v-for="e in uploadError">
          <span class="err-row">Row {{e.rownum}}:</span>
          <span class="error">{{e.error}}</span>
          <a href="javascript:void(0)" @click="() => copy(e.row)">Copy Row</a>
        </div>
        <div class="bottom-btn-row">
          <vs-button color="dark" @click="reset">Try again</vs-button>
          <vs-button color="dark" v-if="isFailed && uploadError.length > 1" @click="copyAllErrorRows">Copy all Rows</vs-button>
        </div>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import { ActionPostFilePayload, ActionPostPayload, IImportError } from '../../types/store';
import { sortImportRow } from '../component_helpers';
import Vue from 'vue'

enum LoadStatus {
  INITIAL = 0,
  SAVING = 1,
  SUCCESS = 2,
  FAILED = 3
}

export default Vue.extend({
  name: 'ImportModal',
  props: {
    title: { type: String, required: false },
    active: { type: Boolean, required: true },
    message: {type: String, required: false},
  },
  data() {
    return {
      uploadedFiles: [],
      uploadError: [] as IImportError[],
      uploadSuccess: '',
      currentStatus: LoadStatus.INITIAL as LoadStatus, 
      uploadFieldName: 'csv',
    }
  },
  computed: {
    isInitial(): boolean {
      return this.currentStatus === LoadStatus.INITIAL;
    },
    isSaving(): boolean {
      return this.currentStatus === LoadStatus.SAVING;
    },
    isSuccess(): boolean {
      return this.currentStatus === LoadStatus.SUCCESS;
    },
    isFailed(): boolean {
      return this.currentStatus === LoadStatus.FAILED;
    }
  },
  methods: {
    filesChange(fieldName: string, fileList: any[]) {
      const formData = new FormData();
      if (!fileList.length) return;
      Array
        .from(Array(fileList.length).keys())
        .map(x => {
          formData.append(fieldName, fileList[x], fileList[x].name);
        });
      this.save(formData);
    },
    copy(row) {
      this.$copyText(sortImportRow(row)).then(v => {
        this.$vs.notify({ text:'Row copied to clipboard'});
      })
    },
    copyAllErrorRows() {
      const rows = this.uploadError.map((e: IImportError) => sortImportRow(e.row));
      this.$copyText(rows.join('\n')).then(v => {
        this.$vs.notify({ text:'All error rows copied to clipboard' });
      })
    },
    save(formData: any) {
      this.currentStatus = LoadStatus.SAVING;
      const payload: ActionPostFilePayload = {
        body: formData,
        callback: this.onResultsCallback
      }
      this.$store.dispatch('uploadCsv', payload)
    },
    onResultsCallback(results: any[], errors: IImportError[]) {
      if (errors.length) {
        this.currentStatus = LoadStatus.FAILED;
        this.uploadError = errors;
        return;
      }
      const numSuccessful = results.length
      let str = `${numSuccessful} line${numSuccessful > 1 ? 's' : ''} ${numSuccessful > 1 ? 'were ' : 'was '}`;
      this.currentStatus = LoadStatus.SUCCESS;
      this.uploadSuccess = `${str}successfully imported!`;
    },
    reset() {
      this.currentStatus = LoadStatus.INITIAL;
      this.uploadedFiles = [];
      this.uploadError   = [];
      this.uploadSuccess = '';
    },
  },
  watch: {
    active(v) {
      if (v) {
        this.reset();
      }
    }
  }
})
</script>

<style scoped>
  h4 {
    font-weight: bold;
    margin-bottom: 10px;
  }
  ul {
    margin-bottom: 15px;
  }
  ul > li {
    margin-left: 20px;
  }
  .container {
    display: flex;
    flex-direction: column;
  }
  .error {
    color: red;
  }
  .warning {
    color: orange;
    margin-bottom: 5px;
  }
  .success {
    color: green;
  }
  .dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 100px;
    position: relative;
    cursor: pointer;
    margin: 20px 0px;
  }

  .input-file {
    opacity: 0;
    /* width: 100%; */
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
  .important {
    font-weight: 600;
    font-size: 16px;
    color:midnightblue;
    text-align: center;
  }
  .err-row {
    font-weight: 600;
    font-style: italic;
  }
  .bottom-btn-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 15px;
  }
</style>