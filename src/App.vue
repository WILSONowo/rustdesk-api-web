<template>
  <router-view />
</template>
<script setup>
import { useDark } from '@vueuse/core'

// Apply the saved theme on authentication pages as well as inside the app.
useDark()
</script>
