<script setup>
import RequestTable from './components/RequestTable.vue';
import { ref } from 'vue';
import CommonItems from './components/CommonItems.vue';
import ExpensiveItems from './components/ExpensiveItems.vue';
import FlameGraph from './components/FlameGraph.vue';
import RequestLogForm from './components/RequestLogForm.vue';

let parsed = ref({});
let tab = ref('flame');
</script>

<template>
  <div class="container">
    <RequestLogForm @parsed="(p) => (parsed = p)" />

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
