<script setup>
import { ref } from 'vue';
const emit = defineEmits('search');
const term = ref();
</script>

<template>
  <nav class="navbar navbar-light bg-light">
    <div></div>

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
        <a class="btn" @click="emit('search', undefined)">Clear</a>
      </div>
      <div class="form-group">
        <input type="text" class="form-control" v-model="term" />
      </div>
      <div class="form-group">
        <a class="btn btn-primary" @click="emit('search', term)">Search</a>
      </div>
    </form>
  </nav>
</template>
