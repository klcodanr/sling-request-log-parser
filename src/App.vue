<script setup>
import RequestTable from './components/RequestTable.vue';
import { ref } from 'vue';
import { RequestLogParser } from './lib/parser.js';
import CommonItems from './components/CommonItems.vue';
import ExpensiveItems from './components/ExpensiveItems.vue';
import FlameGraph from './components/FlameGraph.vue';

let error = ref(undefined);
let tab = ref('all');
let warnings = ref([]);
let raw = '';
let parsed = ref({});
const parser = new RequestLogParser({
  debug: () => {},
  warn: (...msg) => warnings.value.push(msg.join(' ')),
});
function parse() {
  error.value = undefined;
  parsed.value = {};
  warnings.value = [];
  try {
    parsed.value = parser.parse(raw.split(/\n|\r\n/));
  } catch (err) {
    console.error(err);
    error.value = err;
  }
  if (!parsed.value.lines || parsed.value.lines.length === 0) {
    error.value = { message: 'Failed to parse, no valid input provided' };
  }
}
</script>

<template>
  <div class="container">
    <form class="my-4">
      <div class="form-group">
        <textarea
          class="form-control"
          v-model="raw"
          placeholder="Paste request log here..."
        ></textarea>
      </div>
      <div class="form-group my-2">
        <button @click="parse" type="button" class="btn btn-primary">
          Parse
        </button>
      </div>
    </form>

    <div class="alert alert-danger" role="alert" v-if="error">
      {{ error.message }}
    </div>
    <div
      class="alert alert-warning"
      role="alert"
      v-if="warnings && warnings.length > 0"
    >
      <p>WARNING:</p>
      <ul>
        <li v-for="msg in warnings" :key="msg">{{ msg }}</li>
      </ul>
    </div>

    <div class="my-2" v-if="parsed.lines && parsed.lines.length > 0">
      <hr />
      <div class="my-4">
        <h2>
          {{ parsed.lines[0].data.method }} {{ parsed.lines[0].data.path }} by
          {{ parsed.lines[0].data.user }}
        </h2>
        <h3>Total Lines: {{ parsed.lines.length }}</h3>
      </div>

      <ul class="nav nav-tabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            v-bind:class="tab === 'flame' ? 'active' : ''"
            type="button"
            role="tab"
            @click="tab = 'flame'"
          >
            Flame Graph
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            v-bind:class="tab === 'all' ? 'active' : ''"
            type="button"
            role="tab"
            @click="tab = 'all'"
          >
            All Lines
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            v-bind:class="tab === 'expensive' ? 'active' : ''"
            @click="tab = 'expensive'"
            type="button"
            role="tab"
          >
            Expensive Items
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            v-bind:class="tab === 'common' ? 'active' : ''"
            @click="tab = 'common'"
            type="button"
            role="tab"
          >
            Common Items
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            v-bind:class="tab === 'raw' ? 'active' : ''"
            @click="tab = 'raw'"
            type="button"
            role="tab"
          >
            Raw Data
          </button>
        </li>
      </ul>
      <div class="tab-content" id="myTabContent">
        <div
          class="tab-pane"
          role="tabpanel"
          v-bind:class="tab === 'flame' ? 'active show' : ''"
        >
          <FlameGraph :parsed="parsed" />
        </div>
        <div
          class="tab-pane"
          role="tabpanel"
          v-bind:class="tab === 'all' ? 'active show' : ''"
        >
          <RequestTable :parsed="parsed" v-if="tab === 'all'" />
        </div>
        <div
          class="tab-pane"
          role="tabpanel"
          v-bind:class="tab === 'expensive' ? 'active show' : ''"
        >
          <ExpensiveItems :parsed="parsed" v-if="tab === 'expensive'" />
        </div>
        <div
          class="tab-pane"
          role="tabpanel"
          v-bind:class="tab === 'common' ? 'active show' : ''"
        >
          <CommonItems :parsed="parsed" v-if="tab === 'common'" />
        </div>
        <div
          class="tab-pane"
          role="tabpanel"
          v-bind:class="tab === 'raw' ? 'active show' : ''"
        >
          <pre
            class="my-2"
            v-if="tab === 'raw'"
          ><code>{{ JSON.stringify(parsed, null, 2) }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  width: 100%;
  height: 25vh;
  display: block;
  min-height: 300px;
}
</style>
