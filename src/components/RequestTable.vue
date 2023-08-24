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
    <table class="table table-sm table-striped">
      <thead>
        <tr>
          <th>Time</th>
          <th>Type</th>
          <th>Duration</th>
          <th>Execution Duration</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="line in lines" :key="line.time">
          <td>{{ line.time }}</td>
          <td>{{ line.type }}</td>
          <td>{{ line.duration }}</td>
          <td>{{ line.executionDuration }}</td>
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
