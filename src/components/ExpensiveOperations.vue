<script setup>
import { ref } from 'vue';
import TableSearch from './TableSearch.vue';

const props = defineProps(['parsed']);

const items = ref(Object.entries(props.parsed.items));

function search(term) {
  items.value = Object.entries(props.parsed.items).filter(
    (l) => !term || JSON.stringify(l).includes(term),
  );
}
</script>

<template>
  <TableSearch @search="(term) => search(term)" />

  <p>Shows operations which collectively executed for > 1000 microseconds</p>
  <div class="table-responsive">
    <table class="table table-sm table-striped">
      <thead>
        <tr>
          <th class="table-col-sm">Type</th>
          <th>Operation</th>
          <th class="table-col-sm">Count</th>
          <th
            class="table-col-sm"
            title="The total execution duration for all instances of this operation"
          >
            Execution Duration
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in items
            .filter((e) => e[1].executionDuration > 1000)
            .sort(
              (e1, e2) => e2[1].executionDuration - e1[1].executionDuration,
            )"
          :key="entry[0]"
        >
          <td>{{ entry[0].split(':')[0] }}</td>
          <td>
            {{ entry[0].split(':').slice(1).join(':') }}
            <details v-if="entry[1].instances.length > 1">
              <summary>Instances</summary>
              <table class="table table-sm table-striped">
                <thead>
                  <tr>
                    <th class="table-col-sm">Time</th>
                    <th>Instance</th>
                    <th class="table-col-sm">Execution Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="instance in entry[1].instances"
                    :key="instance.time"
                  >
                    <td>{{ instance.time }}</td>
                    <td>{{ instance.name }}</td>
                    <td>
                      {{ instance.executionDuration.toLocaleString() }} μs
                    </td>
                  </tr>
                </tbody>
              </table>
            </details>
          </td>
          <td>{{ entry[1].count.toLocaleString() }}</td>
          <td>
            {{ entry[1].executionDuration.toLocaleString() }} μs<br /><em
              >{{
                (
                  (entry[1].executionDuration / parseFloat(parsed.totalTime)) *
                  100.0
                ).toFixed(4)
              }}%</em
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
