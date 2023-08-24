<script setup>
import { onMounted, onUpdated } from 'vue';
import { flamegraph } from 'd3-flame-graph';
import * as d3 from 'd3';

const props = defineProps(['parsed']);
let chart;
onMounted(() => {
  chart = flamegraph()
    .width(1200)
    .height(400)
    .transitionDuration(750)
    .selfValue(false);
  d3.select('#flame-graph')
    .datum(props.parsed.requestTree.children[0])
    .call(chart);
  var details = document.getElementById('flame-graph--details');
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
    <button
      class="btn btn-outline-success my-2 my-sm-0"
      @click="chart.resetZoom()"
    >
      Reset Zoom
    </button>

    <div class="pull-right">
      <form
        class="row row-cols-lg-auto g-3 align-items-center"
        @submit="
          (event) => {
            event.stopPropagation();
            event.preventDefault();
            emit('search', term);
          }
        "
      >
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
  <div id="flame-graph"></div>
  <p>Element: <span id="flame-graph--details"></span></p>
</template>
