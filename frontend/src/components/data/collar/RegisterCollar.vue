<template>
  <modal
    :title="title"
    :active="active"
    v-on:update:modal="$emit('update:close')"
  >
    <input 
      type="file"
      @change="fileSelected"
    >
    <br/><br/>
    <div>Device ID: {{device_id}}</div>
    <div>Satellite Network: {{sat_network}}</div>
    <vs-button button="submit" @click="save" class="btn-save" type="border">Save</vs-button>
  </modal>
</template>

<script>
export default {
  name: 'RegisterCollarModal',
  props: {
    title: String,
    active: Boolean,
  },
  data() {
    return {
      file: {},
      device_id: '',
      sat_network: ''
    }
  },
  methods: {
    fileSelected(event) {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        this.file = selectedFile;
        this.parse();
      } 
    },
    async parse() {
      const reader = new FileReader();
      reader.onload = e => {
        const readXml = e.target.result;
        const parser = new DOMParser();
        try {
          var doc = parser.parseFromString(readXml, "application/xml");
          this.device_id = doc.childNodes[0].firstElementChild.attributes['ID'].nodeValue;
          this.sat_network = doc.childNodes[0].childNodes[1].childNodes[1].childNodes[1].attributes.comType.nodeValue;
          console.log(`devuce id ${this.device_id}: obtained from parsing .keyx`);
        } catch(e) {
          console.log(`error parsing .keyx xml: ${e}`);
        }
      };
      reader.readAsText(this.file);
    },
    save() {
      console.log(this.device_id);
      console.log(this.sat_network);
    },
    handleClose() {
      this.reset();
      this.$emit('update:modal')
    },
    reset() {
      this.file = {};
      this.device_id = '';
      this.sat_network = '';
    }
  },
  mounted () {
    this.reset();
  }
}
// const parseFile = () => {
//   console.log('loading collars completed' )
// }
</script>

<style scoped>
.btn-save {
  float:right;
}
</style>