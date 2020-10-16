<template>
  <div >
    <vs-table
      pagination
      :data="collars.availableCollars"
      v-model="selected"
      @selected="handleSelected"
    >
      <template slot="header">
        <h3>Available Collars</h3>
      </template>

      <template slot="thead">
        <vs-th v-for="(value, propName) in collars.availableCollars[0]" :key="propName">
          {{propName}}
        </vs-th>
      </template>

      <template slot-scope="{data}">
        <vs-tr :key="index" v-for="(collar, index) in collars.availableCollars" :data="collar" >
          <vs-td :key="v" v-for="(k, v) in collar" :data="k">
            {{k}}
          </vs-td>
        </vs-tr> 
      </template>
    </vs-table>
    <!-- <button>See Collar Details</button> -->
    <br/>

    <vs-table 
      pagination
      :data="collars.assignableCollars"
      v-model="selected"
      @selected="handleSelected"
    >
      <template slot="header">
        <h3>{{title}} Assignable Collars</h3>
      </template>

      <template slot="thead">
        <vs-th v-for="(value, propName) in collars.assignableCollars[0]" :key="propName">
          {{propName}}
        </vs-th>
      </template>

      <template slot-scope="{data}">
        <vs-tr :key="index" v-for="(collar, index) in collars.assignableCollars" :data="collar" >
          <vs-td :key="v" v-for="(k, v) in collar" :data="k">
            {{k}}
          </vs-td>
        </vs-tr> 
      </template>
    </vs-table>
    <!-- <pre>{{ selected['Device ID'] }}</pre> -->
    <div>
      <button>Register New Collar</button>
      <button>Retire Collar</button>
      <button>See Collar Details</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    title: String,
  },
  name: 'collars',
  computed: mapState(['collars']),
  data: function() {
    return {
      selected: [],
      message: 'hi',
    }
  },
  methods: {
    handleSelected(tr) {
      this.$vs.notify({ title: `device ${tr['Device ID']} selected` })
    }
  },
  mounted() {
    this.$store.dispatch('requestCollars', callback);
  }
}

const callback = () => {
  console.log('loading collars completed' )
}


</script>

<style scoped>
  h3 {
    margin-bottom: 10px;
  }
  button {
    padding: 3px 15px;
  }
</style>

