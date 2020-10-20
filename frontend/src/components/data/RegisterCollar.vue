<template>
  <vs-popup 
    class="holamundo" 
    title="Register A New Vectronics Collar"
    :active.sync="show">
    <input 
      type="file"
      @change="fileSelected"
    >
    <vs-button
      :disabled="uploadDisabled"
      type="border"
      button="submit"
      @click="parse"
    >upload</vs-button>
    <br/><br/>
    <div>Device ID: {{device_id}}</div>
    <div>Satellite Network: {{sat_network}}</div>
    <vs-button disabled button="submit" @click="save" class="btn-save" type="border">Save</vs-button>
  </vs-popup>
</template>

<script>
import Vue from 'vue';
import Input from '../form/Input';

Vue.component('input-type', Input);

export default {
  name: 'RegisterCollarModal',
  props: {
    active: Boolean,
  },
  data() {
    return {
      file: {},
      uploadDisabled: true,
      device_id: '',
      sat_network: ''
    }
  },
  methods: {
    fileSelected(event) {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        this.file = selectedFile;
        this.uploadDisabled = false;
      } else this.uploadDisabled = true;
    },
    async parse() {
      // console.log(`uploading file: ${this.data}`)
      const reader = new FileReader();
      reader.onload = e => {
        const readXml = e.target.result;
        const parser = new DOMParser();
        try {
          var doc = parser.parseFromString(readXml, "application/xml");
          // console.log(doc);
          this.device_id = doc.childNodes[0].firstElementChild.attributes['ID'].nodeValue;
          this.sat_network = doc.childNodes[0].childNodes[1].childNodes[1].childNodes[1].attributes.comType.nodeValue;
        } catch(e) {
          console.log(`error parsing xml: ${e}`);
        }
      };
      reader.readAsText(this.file);
    },
    save() {

    }
  },
  computed: {
    show: {
      get: function() {
        return this.active;
      },
      set: function(newValue) {
        this.$emit('update:modal', newValue)
      }
    }
  },
}
const parseFile = () => {
  console.log('loading collars completed' )
}
</script>

<style scoped>
.btn-save {
  float:right;
}
</style>