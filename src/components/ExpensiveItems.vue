<script setup>
defineProps(['parsed'])
</script>

<template>
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
          v-for="entry in Object.entries(parsed.items).filter(e => e[1].executionDuration > 1000).sort((e1, e2) => e2[1].executionDuration - e1[1].executionDuration)"
          :key="entry[0]">
          <td>{{ entry[0].split(':')[0] }}</td>
          <td>{{ entry[0].split(':').slice(1).join(':') }}</td>
          <td>{{ entry[1].count }}</td>
          <td>{{ entry[1].executionDuration }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
