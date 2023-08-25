<script setup>
import { onMounted, onUpdated } from 'vue';
import { flamegraph } from 'd3-flame-graph';
import * as d3 from 'd3';

const props = defineProps(['parsed']);
let chart;
onMounted(() => {

  var details = document.getElementById('flame-graph--details');
  chart = flamegraph()
    .width(1050)
    .height(400)
    .setColorMapper((el, originalColor) => {
      if (el.highlight) {
        return originalColor
      };
      if (el.data.name.includes('/libs') || el.data.name.includes('com.day') || el.data.name.includes('com.adobe')) {
        return '#f68d2e';
      }
      if (el.data.name.includes('org.apache') || ['handleSecurity', 'ResourceResolution', 'ServletResolution'].includes(el.data.name)) {
        return '#D22128'
      }
      if (el.data.name.includes('/apps') || el.data.name.includes('/mnt') || el.data.name.includes('/conf') || el.data.name.includes('/content') || el.data.name.includes('com.')) {
        return '#0dcaf0';
      }

      return '#adb5bd';
    });
  d3.select('#flame-graph')
    .datum(props.parsed.requestTree.children[0])
    .call(chart);
  chart.setDetailsElement(details);
});

onUpdated(() => {
  d3.select('#flame-graph')
    .datum(props.parsed.requestTree.children[0])
    .call(chart);
});

function search() {
  const value = document.getElementById('flame-graph-term').value;
  chart.search(value);
}
</script>

<template>
  <nav class="navbar navbar-light bg-light">
    <button class="btn btn-outline-success my-2 my-sm-0" @click="chart.resetZoom()">
      Reset Zoom
    </button>

    <div class="pull-right">
      <form class="row row-cols-lg-auto g-3 align-items-center" @submit="(event) => {
        event.stopPropagation();
        event.preventDefault();
        emit('search', term);
      }
        ">
        <div class="form-group">
          <a class="btn" @click="chart.clear()">Clear</a>
        </div>
        <div class="form-group">
          <input type="text" class="form-control" id="flame-graph-term" />
        </div>
        <div class="form-group">
          <a class="btn btn-primary" @click="search()">Search</a>
        </div>
      </form>
    </div>
  </nav>
  <div class="container">
    <div class="row">
      <div class="col">
        <div id="flame-graph"></div>
        <p>Element: <span id="flame-graph--details"></span></p>
      </div>
      <div class="col-2">
        <h3>Color Key</h3>
        <ul class="list-unstyled">
          <li>
            <span class="color-block" style="background-color: #f68d2e;"></span>
            AEM/Adobe
          </li>
          <li>
            <span class="color-block" style="background-color: #D22128;"></span>
            Apache Sling
          </li>
          <li>
            <span class="color-block" style="background-color: #0dcaf0;"></span>
            Customer / Extension
          </li>
          <li>
            <span class="color-block" style="background-color: #adb5bd;"></span>
            Other
          </li>
        </ul>

      </div>
    </div>
  </div>
</template>

<style scoped>
.color-block {
  display: inline-block;
  height: 20px;
  width: 20px;
}

.col {
  overflow: auto;
}
</style>
