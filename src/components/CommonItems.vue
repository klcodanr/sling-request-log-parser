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
  <div class="table-responsive">
    <table class="table table-sm table-striped">
      <thead>
        <tr>
          <th>Type</th>
          <th>Item</th>
          <th>Count</th>
          <th>Execution Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in items
            .filter((e) => e[1].count > 1)
            .sort((e1, e2) => e2[1].count - e1[1].count)"
          :key="entry[0]"
        >
          <td>{{ entry[0].split(':')[0] }}</td>
          <td>{{ entry[0].split(':').slice(1).join(':') }}</td>
          <td>{{ entry[1].count }}</td>
          <td>{{ entry[1].executionDuration }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
