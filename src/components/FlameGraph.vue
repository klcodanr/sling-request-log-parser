<script setup>
import { onMounted, onUpdated } from 'vue'
import { flamegraph } from 'd3-flame-graph';
import * as d3 from 'd3';

const props = defineProps(['parsed']);
let chart;
onMounted(() => {
    chart = flamegraph().width(1200).height(400).transitionDuration(750).selfValue(false);
    d3.select('#flame-graph').datum(props.parsed.requestTree.children[0]).call(chart);
    var details = document.getElementById("flame-graph--details");
    chart.setDetailsElement(details);
});

onUpdated(() => {
    d3.select('#flame-graph').datum(props.parsed.requestTree.children[0]).call(chart);
})

</script>

<template>
    <nav class="navbar navbar-light bg-light">
        <div class="form-inline">
            <button class="btn btn-outline-success my-2 my-sm-0" @click="chart.resetZoom();">Reset</button>
        </div>
    </nav>
    <div id="flame-graph"></div>
    <div id="flame-graph--details"></div>
</template>
