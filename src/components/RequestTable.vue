<script setup>
import { ref } from 'vue';
import TableSearch from './TableSearch.vue';

const props = defineProps(['parsed']);

const lines = ref(props.parsed.lines);

function search(term) {
  lines.value = props.parsed.lines.filter(
    (l) => !term || JSON.stringify(l).includes(term),
  );
}
</script>

<template>
  <TableSearch @search="(term) => search(term)" />
  <div class="table-responsive">
    <table class="table table-sm">
      <thead>
        <tr>
          <th class="table-col-sm">Time</th>
          <th class="table-col-sm">Type</th>
          <th
            class="table-col-sm"
            title="The total time the operation took, including child operations"
          >
            Duration (μs)
          </th>
          <th
            class="table-col-sm"
            title="The total time only this operation took, subtracting child operations"
          >
            Execution Duration (μs)
          </th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="line in lines"
          :key="line.time"
          :class="{
            'table-danger': line.executionDuration > 100000,
            'table-warning':
              line.executionDuration > 10000 && line.executionDuration < 100000,
            'table-light':
              line.executionDuration > 1000 && line.executionDuration < 10000,
          }"
          :title="line.line"
        >
          <td>{{ line.time }}</td>
          <td>{{ line.type }}</td>
          <td>
            <span v-if="line.duration"
              >{{ (line.duration / 1000000.0).toFixed(4) }} s
              <small>({{ line.duration.toLocaleString() }} μs)</small></span
            >
          </td>
          <td>
            <span v-if="line.executionDuration"
              >{{ (line.executionDuration / 1000000.0).toFixed(4) }} s
              <small>({{ line.executionDuration.toLocaleString() }} μs)</small
              ><br /><em
                >{{
                  (
                    (line.executionDuration / parseFloat(parsed.totalTime)) *
                    100.0
                  ).toFixed(4)
                }}%</em
              ></span
            >
          </td>
          <td>
            <ul>
              <li v-for="entry in Object.entries(line.data)" :key="entry[0]">
                {{ entry[0] }}: {{ entry[1] }}
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
