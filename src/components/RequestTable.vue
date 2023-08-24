<script setup>
defineProps(['parsed'])
</script>

<template>
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
        <tr v-for="line in parsed.lines" :key="line.time">
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
