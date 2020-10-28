<template>
  <modal 
    class='grp-col'
    title="Add Animal"
    :active="active"
    :handleClose="handleClose">
      <h3>General Information</h3><hr/>
      <div class="grp">
        <input-type label="Nickname" propId="nickname" :val="nickname"></input-type>
        <input-type label="Animal ID*" propId="animal_id" :val="animal_id"></input-type>
        <input-type label="WLHID*" propId="wlh_id" :val="wlh_id"></input-type>
      </div>

    <h3>Group Management</h3><hr/>
      <input-select></input-select>

    <h3>Individual Characteristics</h3><hr/>
    <div class="grp">
      <input-select></input-select>
      <input-type label="Species" propId="species" :val="species"></input-type>
    </div>

    <h3>Assigned GPS Collar</h3><hr/>
    <div class="grp">
      <input-type label="Species" propId="species" :val="species"></input-type>
    </div>

    <vs-button disabled button="submit" @click="save" class="btn-save" type="border">Save</vs-button>
  </modal>
</template>

<script>
export default {
  name: 'AddAnimal',
  props: {
    active: Boolean,
  },
  data() {
    return {
      animal_id: '',
      wlh_id: '',
      nickname: '',
      region: '',
      species: '',
      device_id: '',
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:modal')
    },
    save() {
    }
  },
}
</script>

<style scoped>
.holamundo {
  display: flex;
  flex-direction: row;
}
.grp-split {
  display: flex;
  flex-direction: row;
}
.grp-col {
  display: flex;
  flex-direction: column;
}
.grp {
  display: flex;
  flex-direction: row;
  margin: 15px 0px;
}
.btn-save {
  float:right;
}
h3 {
  margin: 5px 0px;
}
</style>