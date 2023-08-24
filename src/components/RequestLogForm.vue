<script setup>
import { ref } from 'vue';
import { RequestLogParser } from '../lib/parser.js';

const LS_KEY = 'sling-request-log';

const rawLog = ref(localStorage.getItem(LS_KEY));
const emit = defineEmits(['parsed']);

let error = ref(undefined);
let warnings = ref([]);
const parser = new RequestLogParser({
  debug: () => {},
  warn: (...msg) =>
    warnings.value.push(
      msg
        .map((el) => {
          if (typeof el === 'string') {
            return el;
          } else {
            return JSON.stringify(el);
          }
        })
        .join(' '),
    ),
});
function parse() {
  error.value = undefined;
  warnings.value = [];

  emit('parsed', {});
  try {
    const parsed = parser.parse(rawLog.value.split(/\n|\r\n/));
    if (!parsed.lines || parsed.lines.length === 0) {
      error.value = { message: 'Failed to parse, no valid input provided' };
    } else {
      localStorage.setItem(LS_KEY, rawLog.value);
      emit('parsed', parsed);
    }
  } catch (err) {
    console.error(err);
    error.value = err;
  }
}
</script>

<template>
  <form class="my-4">
    <div class="form-group">
      <textarea
        class="form-control"
        id="request-log-input"
        placeholder="Paste request log here..."
        rows="10"
        v-model="rawLog"
      ></textarea>
    </div>
    <div class="form-group my-2">
      <button @click="parse" type="button" class="btn btn-primary">
        Parse
      </button>
    </div>
  </form>

  <div class="alert alert-danger" role="alert" v-if="error">
    {{ error.message }}
  </div>
  <div
    class="alert alert-warning"
    role="alert"
    v-if="warnings && warnings.length > 0"
  >
    <p>WARNING:</p>
    <ul>
      <li v-for="msg in warnings" :key="msg">{{ msg }}</li>
    </ul>
  </div>
</template>
