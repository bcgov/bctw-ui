<template>
  <div>
    <input type="file" @change="fileSelected">
  </div>
</template>

<script>
export default {
  name: 'KeyxInputParse',
  data() {
    return {
      file: {},
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
          const device_id = +doc.childNodes[0].firstElementChild.attributes['ID'].nodeValue;
          const satellite_network = doc.childNodes[0].childNodes[1].childNodes[1].childNodes[1].attributes.comType.nodeValue;
          // console.log(`device id ${this.device_id}: obtained from parsing .keyx`);
          this.$emit('keyx:parsed', {device_id, satellite_network});
        } catch(e) {
          console.log(`error parsing .keyx xml: ${e}`);
        }
      };
      reader.readAsText(this.file);
    },
    reset() {
      this.file = {};
    }
  },
  mounted () {
    this.reset();
  }
}
</script>

<style scoped>
.btn-save {
  float:right;
}
</style>